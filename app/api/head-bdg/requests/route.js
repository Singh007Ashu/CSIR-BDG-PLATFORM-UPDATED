import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireRole } from "../../../../lib/session";

export async function GET() {
  const { error } = await requireRole(["HEAD_BDG", "ADMIN"]); if (error) return error;
  const [changeRequests, techRequests, problemStatements, partnerships] = await Promise.all([
    prisma.changeRequest.findMany({ include: { lab: true, technology: true, decidedBy: { select: { name: true } }, history: { include: { actedByUser: { select: { name: true } } }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } }),
    prisma.technologyRequest.findMany({ include: { technology: { include: { lab: true } }, organization: true, decidedBy: true }, orderBy: { createdAt: "desc" } }),
    prisma.problemStatement.findMany({ include: { organization: true, lab: true, decidedBy: true }, orderBy: { createdAt: "desc" } }),
    prisma.partnership.findMany({ include: { organization: true, lab: true, decidedBy: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ changeRequests, techRequests, problemStatements, partnerships });
}
