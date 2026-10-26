
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "../../../../../lib/db";
import { requireRole } from "../../../../../lib/session";
import { hashPassword } from "../../../../../lib/password";
import { logAudit } from "../../../../../lib/labAuth";

const ROLES = ["SUPER_ADMIN", "ADMIN", "HEAD_ADMIN", "HEAD_BDG", "BDG", "CPD", "IMD", "TMD", "IPU", "URDIP", "ICM", "LAB_BD", "PI", "READ_ONLY", "APPLICANT"];
export async function PATCH(req, { params }) {
  const { session, error } = await requireRole(["ADMIN"]); if (error) return error;
  const body = await req.json(); const data = {}; let temporaryPassword = null;
  if (body.role !== undefined) { if (!ROLES.includes(body.role)) return NextResponse.json({ error: "Invalid role." }, { status: 400 }); data.role = body.role; }
  if (body.accountStatus !== undefined) { if (!["ACTIVE", "INACTIVE"].includes(body.accountStatus)) return NextResponse.json({ error: "Invalid status." }, { status: 400 }); data.accountStatus = body.accountStatus; }
  if (body.resetPassword) { temporaryPassword = `Csir@${randomBytes(6).toString("base64url")}9`; const password = await hashPassword(temporaryPassword); data.passwordHash = password.passwordHash; data.passwordSalt = password.passwordSalt; }
  const user = await prisma.user.update({ where: { id: Number((await params).id) }, data, select: { id: true, name: true, email: true, role: true, accountStatus: true } });
  await logAudit({ actorType: "USER", actorUserId: session.userId, action: body.resetPassword ? "USER_PASSWORD_RESET" : "USER_UPDATED", entityType: "USER", entityId: user.id, details: { role: data.role, accountStatus: data.accountStatus } });
  return NextResponse.json({ user, temporaryPassword });
}


