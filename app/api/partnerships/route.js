import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { requireUser, requireAnyAuth } from "../../../lib/session";
import { collaborationScope, collaborationIncludes } from "../../../lib/collaborationAccess";

export async function GET() {
  const { session, error } = await requireAnyAuth();
  if (error) return error;
  const items = await prisma.partnership.findMany({
    where: collaborationScope(session),
    include: { ...collaborationIncludes },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req) {
  const { session, error } = await requireUser();
  if (error) return error;
  if (session.role !== "APPLICANT") return NextResponse.json({ error: "Industry challenges can only be submitted from an Industry / Applicant account." }, { status: 403 });

  const body = await req.json();
  const organizationId = session.organizationId;
  if (!organizationId) {
    return NextResponse.json({ error: "No organization linked to this account." }, { status: 400 });
  }
  const item = await prisma.partnership.create({
    data: {
      organizationId,
      challengeStatement: body.challengeStatement || null,
      expectedOutcome: body.expectedOutcome || null,
      commercialPotential: body.commercialPotential || null,
      technologyGap: body.technologyGap || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
