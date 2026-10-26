import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/db";
import { verifyPassword } from "../../../../lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "../../../../lib/auth";
import { requestMeta } from "../../../../lib/request";

export async function POST(req) {
  const body = await req.json();
  const email = String(body.email || "").toLowerCase().trim();
  const user = email ? await prisma.user.findUnique({ where: { email }, include: { organization: true, assignedLab: { select: { code: true, name: true } } } }) : null;
  const success = Boolean(user && user.accountStatus === "ACTIVE" && await verifyPassword(body.password, user.passwordHash, user.passwordSalt));
  await prisma.loginHistory.create({ data: { userId: user?.id || null, success, ...requestMeta(req) } });
  if (!success) return NextResponse.json({ error: "Invalid email or password, or the account is inactive." }, { status: 401 });
  const token = await createSessionToken({ type: "user", userId: user.id, role: user.role, name: user.name, email: user.email, organizationId: user.organizationId || null, assignedLabId: user.assignedLabId || null });
  (await cookies()).set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, assignedLabId: user.assignedLabId, assignedLab: user.assignedLab, organization: user.organization });
}
