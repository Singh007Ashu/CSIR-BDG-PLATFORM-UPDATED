import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "../../../../../lib/db";
import { requireRole } from "../../../../../lib/session";
import { hashPassword } from "../../../../../lib/password";
import { notifyLab, logAudit } from "../../../../../lib/labAuth";

export async function PATCH(req, { params }) {
  const { session, error } = await requireRole(["ADMIN"]); if (error) return error;
  const body = await req.json(); const allowed = ["PENDING", "ACTIVE", "INACTIVE", "UNREGISTERED"]; const data = {}; let temporaryPassword = null;
  if (body.accountStatus !== undefined) { if (!allowed.includes(body.accountStatus)) return NextResponse.json({ error: "Invalid lab status." }, { status: 400 }); data.accountStatus = body.accountStatus; data.approvedAt = body.accountStatus === "ACTIVE" ? new Date() : null; }
  if (body.resetPassword) { temporaryPassword = `CsirLab@${randomBytes(5).toString("base64url")}9`; const password = await hashPassword(temporaryPassword); data.passwordHash = password.passwordHash; data.passwordSalt = password.passwordSalt; }
  if (!Object.keys(data).length) return NextResponse.json({ error: "No laboratory update was supplied." }, { status: 400 });
  const lab = await prisma.lab.update({ where: { id: Number((await params).id) }, data });
  if (body.accountStatus !== undefined) await notifyLab(lab.id, { type: body.accountStatus === "ACTIVE" ? "APPROVAL_GRANTED" : "ACCOUNT_STATUS", title: "Laboratory account status updated", message: `Your account is now ${body.accountStatus}.`, link: "/lab-login" });
  await logAudit({ actorType: "USER", actorUserId: session.userId, action: body.resetPassword ? "LAB_PASSWORD_RESET" : "LAB_STATUS_CHANGED", entityType: "LAB", entityId: lab.id, details: { accountStatus: body.accountStatus } });
  return NextResponse.json({ lab, temporaryPassword });
}