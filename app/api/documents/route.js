import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "../../../lib/db";
import { requireAnyAuth } from "../../../lib/session";
import { canAccessEntity, ENTITY_FIELD } from "../../../lib/entityAccess";
import { saveUpload } from "../../../lib/storage";
import { cleanText, optionalText } from "../../../lib/request";
import { logAudit, notifyHeadBdgAndAdmins } from "../../../lib/labAuth";

export const runtime = "nodejs";

export async function GET(req) {
  const { session, error } = await requireAnyAuth();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const entityType = cleanText(searchParams.get("entityType"), 30).toUpperCase();
  const entityId = Number(searchParams.get("entityId"));
  const access = await canAccessEntity(session, entityType, entityId);
  if (!access.allowed) return NextResponse.json({ error: "Record not found or access denied." }, { status: 404 });
  const documents = await prisma.document.findMany({
    where: { entityType, entityId, deletedAt: null, ...(searchParams.get("history") === "1" ? {} : { isCurrent: true }) },
    include: { uploadedByLab: { select: { name: true } }, uploadedByUser: { select: { name: true } } },
    orderBy: [{ versionGroup: "asc" }, { version: "desc" }],
  });
  return NextResponse.json(documents);
}

export async function POST(req) {
  const { session, error } = await requireAnyAuth();
  if (error) return error;
  const form = await req.formData();
  const entityType = cleanText(form.get("entityType"), 30).toUpperCase();
  const entityId = Number(form.get("entityId"));
  if (entityType === "COMMERCIAL_ENGAGEMENT" && session.type !== "lab") return NextResponse.json({ error: "Only the laboratory can change pricing documents." }, { status: 403 });
  if (!ENTITY_FIELD[entityType]) return NextResponse.json({ error: "Unsupported document record type." }, { status: 400 });
  const access = await canAccessEntity(session, entityType, entityId, true);
  if (!access.allowed) return NextResponse.json({ error: "Record not found or access denied." }, { status: 404 });
  const files = form.getAll("files").filter((file) => file && typeof file.arrayBuffer === "function");
  if (!files.length || files.length > 10) return NextResponse.json({ error: "Upload between 1 and 10 files." }, { status: 400 });
  const created = [];
  for (const file of files) {
    try {
      const saved = await saveUpload(file, entityType, entityId);
      const data = {
        entityType, entityId, [ENTITY_FIELD[entityType]]: entityId, fileName: cleanText(file.name, 255), fileType: saved.extension,
        mimeType: cleanText(file.type, 150) || null, filePath: saved.relativePath, fileSize: file.size, versionGroup: randomUUID(),
        description: optionalText(form.get("description"), 1000), uploadedByLabId: session.type === "lab" ? session.labId : null,
        uploadedByUserId: session.type === "user" ? session.userId : null,
      };
      created.push(await prisma.document.create({ data }));
    } catch (uploadError) {
      return NextResponse.json({ error: uploadError.message || "Upload failed." }, { status: 400 });
    }
  }
  await logAudit({ actorType: session.type.toUpperCase(), actorLabId: session.type === "lab" ? session.labId : null, actorUserId: session.type === "user" ? session.userId : null, action: "DOCUMENT_UPLOADED", entityType, entityId, details: { count: created.length } });
  if (entityType === "MOU") await notifyHeadBdgAndAdmins({ type: "NEW_MOU_UPLOADED", title: "New MOU document uploaded", message: `${created.length} MOU document(s) were uploaded.`, link: "/mou-repository" });
  if (entityType === "LAB_PROFILE") await notifyHeadBdgAndAdmins({ type: "LAB_PROFILE_UPDATED", title: "Laboratory profile uploaded", message: "New laboratory presentation is available.", link: "/lab-profiles" });
  return NextResponse.json(created, { status: 201 });
}
