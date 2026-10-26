import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { requireUser, requireAnyAuth } from "../../../lib/session";
import { collaborationScope, collaborationIncludes } from "../../../lib/collaborationAccess";

export async function GET() {
  const { session, error } = await requireAnyAuth();
  if (error) return error;
  const items = await prisma.problemStatement.findMany({
    where: collaborationScope(session),
    include: { ...collaborationIncludes, proposal: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (session.role !== "APPLICANT") return NextResponse.json({ error: "Problem statements can only be submitted from an Industry / Applicant account." }, { status: 403 });

  const body = await req.json();
  if (!body.description) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }
  const organizationId = session.organizationId;
  if (!organizationId) {
    return NextResponse.json({ error: "No organization linked to this account." }, { status: 400 });
  }
  const item = await prisma.problemStatement.create({
    data: {
      organizationId,
      description: body.description,
      currentStatus: body.currentStatus || null,
      painPoints: body.painPoints || null,
      budget: body.budget ? Number(body.budget) : null,
      timeline: body.timeline || null,
      expectedOutcome: body.expectedOutcome || null,
      domain: body.domain || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
