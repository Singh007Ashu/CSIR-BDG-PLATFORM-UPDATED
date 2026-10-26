import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import { isManagerRole } from "./roles";

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (session && !session.type) session.type = "user";
  return session;
}

function denied(message, status) { return { error: NextResponse.json({ error: message }, { status }) }; }

export async function requireUser() {
  const session = await getSession();
  if (!session || session.type !== "user") return denied("Login required.", 401);
  return { session };
}

export async function requireLab() {
  const session = await getSession();
  if (!session || session.type !== "lab") return denied("Lab login required.", 401);
  return { session };
}

export async function requireAnyAuth() {
  const session = await getSession();
  if (!session) return denied("Login required.", 401);
  return { session };
}

export async function requireRole(roles) {
  const { session, error } = await requireUser();
  if (error) return { error };
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (session.role === "SUPER_ADMIN" || allowed.includes(session.role)) return { session };
  return denied("You do not have permission to perform this action.", 403);
}

export function isManager(session) { return session?.type === "user" && isManagerRole(session.role); }
export function isAdmin(session) { return session?.type === "user" && ["SUPER_ADMIN", "ADMIN"].includes(session.role); }
