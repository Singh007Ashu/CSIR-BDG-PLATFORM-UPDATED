import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/session";
import { prisma } from "../../../../lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.type !== "lab") return NextResponse.json({ lab: null });

  const lab = await prisma.lab.findUnique({ where: { id: session.labId } });
  if (!lab) return NextResponse.json({ lab: null });

  return NextResponse.json({
    lab: {
      id: lab.id,
      name: lab.name,
      code: lab.code,
      labId: lab.labId,
      piName: lab.piName,
      authorizedPerson: lab.authorizedPerson,
      designation: lab.designation,
      officialEmail: lab.officialEmail,
      mobileNumber: lab.mobileNumber,
      accountStatus: lab.accountStatus,
    },
  });
}
