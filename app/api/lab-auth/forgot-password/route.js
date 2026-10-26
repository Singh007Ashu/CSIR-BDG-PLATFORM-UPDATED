import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { createSessionToken } from "../../../../lib/auth";

export async function POST(req) {
  const body = await req.json();
  const officialEmail = String(body.officialEmail || "").toLowerCase().trim();
  const response = { ok: true, message: "If this email is registered, password reset instructions have been sent." };
  if (!officialEmail) return NextResponse.json({ error: "Official email is required." }, { status: 400 });
  const lab = await prisma.lab.findUnique({ where: { officialEmail } });
  if (!lab) return NextResponse.json(response);
  const resetToken = await createSessionToken({ type: "lab-reset", labId: lab.id, purpose: "password-reset" }, 15 * 60);
  if (process.env.NODE_ENV !== "production") return NextResponse.json({ ...response, devResetToken: resetToken });
  return NextResponse.json(response);
}
