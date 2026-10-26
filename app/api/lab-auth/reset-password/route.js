import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { verifySessionToken } from "../../../../lib/auth";
import { hashPassword, validatePassword } from "../../../../lib/password";
import { logAudit } from "../../../../lib/labAuth";

export async function POST(req) {
  const body = await req.json();
  const passwordError = validatePassword(body.newPassword);
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
  const payload = await verifySessionToken(body.token);
  if (!payload || payload.type !== "lab-reset" || payload.purpose !== "password-reset") return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
  const { passwordHash, passwordSalt } = await hashPassword(body.newPassword);
  await prisma.lab.update({ where: { id: payload.labId }, data: { passwordHash, passwordSalt } });
  await logAudit({ actorType: "LAB", actorLabId: payload.labId, action: "PASSWORD_RESET" });
  return NextResponse.json({ ok: true });
}
