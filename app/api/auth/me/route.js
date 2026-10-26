import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/session";
import { prisma } from "../../../../lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.type !== "user") return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { organization: true, assignedLab: { select: { id: true, code: true, name: true } } } });
  if (!user || user.accountStatus !== "ACTIVE") return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, assignedLabId: user.assignedLabId, assignedLab: user.assignedLab, organization: user.organization } });
}
