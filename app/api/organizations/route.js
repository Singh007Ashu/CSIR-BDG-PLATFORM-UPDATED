import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { requireUser } from "../../../lib/session";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;
  const orgs = await prisma.organization.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(orgs);
}

export async function POST(req) {
  const { error } = await requireUser();
  if (error) return error;
  const body = await req.json();
  if (!body.name || !body.type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }
  const org = await prisma.organization.create({
    data: {
      name: body.name,
      type: body.type,
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
    },
  });
  return NextResponse.json(org, { status: 201 });
}
