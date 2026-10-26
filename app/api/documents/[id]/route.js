import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireAnyAuth } from "../../../../lib/session";
import { canAccessEntity, ENTITY_FIELD } from "../../../../lib/entityAccess";
import { saveUpload } from "../../../../lib/storage";
import { cleanText, optionalText } from "../../../../lib/request";
import { logAudit } from "../../../../lib/labAuth";

export const runtime = "nodejs";

export async function PATCH(req, { params }) {
  const { session, error } = await requireAnyAuth();
  if (error) return error;
  const existing = await prisma.document.findUnique({ where: { id: Number((await params).id) } });
  if (!existing || existing.deletedAt) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (existing.entityType === "COMMERCIAL_ENGAGEMENT" && session.type !== "lab") return NextResponse.json({ error: "Only the laboratory can change pricing documents." }, { status: 403 });
  const access = await canAccessEntity(session, existing.entityType, existing.entityId, true);
  if (!access.allowed) return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    const updated = await prisma.document.update({ where: { id: existing.id }, data: { description: optionalText(form.get("description"), 1000) } });
    return NextResponse.json(updated);
  }
  let saved;
  try { saved = await saveUpload(file, existing.entityType, existing.entityId); }
  catch (error) { return NextResponse.json({ error: error.message || "Upload failed." }, { status: 400 }); }
  const replacement = await prisma.$transaction(async (tx) => {
    await tx.document.update({ where: { id: existing.id }, data: { isCurrent: false } });
    return tx.document.create({ data: {
      entityType: existing.entityType, entityId: existing.entityId, [ENTITY_FIELD[existing.entityType]]: existing.entityId,
      fileName: cleanText(file.name, 255), fileType: saved.extension, mimeType: cleanText(file.type, 150) || null,
      filePath: saved.relativePath, fileSize: file.size, versionGroup: existing.versionGroup, version: existing.version + 1,
      description: optionalText(form.get("description"), 1000) ?? existing.description, supersedesId: existing.id,
      uploadedByLabId: session.type === "lab" ? session.labId : null, uploadedByUserId: session.type === "user" ? session.userId : null,
    } });
  });
  await logAudit({ actorType: session.type.toUpperCase(), actorLabId: session.type === "lab" ? session.labId : null, actorUserId: session.type === "user" ? session.userId : null, action: "DOCUMENT_REPLACED", entityType: existing.entityType, entityId: existing.entityId, details: { previousId: existing.id, replacementId: replacement.id } });
  return NextResponse.json(replacement);
}

export async function DELETE(req, { params }) {
  const { session, error } = await requireAnyAuth();
  if (error) return error;
  const document = await prisma.document.findUnique({ where: { id: Number((await params).id) } });
  if (!document || document.deletedAt) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (document.entityType === "COMMERCIAL_ENGAGEMENT" && session.type !== "lab") return NextResponse.json({ error: "Only the laboratory can change pricing documents." }, { status: 403 });
  const access = await canAccessEntity(session, document.entityType, document.entityId, true);
  if (!access.allowed) return NextResponse.json({ error: "Access denied." }, { status: 403 });
  await prisma.document.update({ where: { id: document.id }, data: { deletedAt: new Date(), isCurrent: false } });
  await logAudit({ actorType: session.type.toUpperCase(), actorLabId: session.type === "lab" ? session.labId : null, actorUserId: session.type === "user" ? session.userId : null, action: "DOCUMENT_DELETED", entityType: document.entityType, entityId: document.entityId, details: { documentId: document.id } });
  return NextResponse.json({ ok: true });
}
