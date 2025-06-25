import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const link = await prisma.linkElement.create({
    data: {
      description: data.description,
      argumentId: Number(data.argumentId),
      macroargumentId: Number(data.macroargumentId),
    },
  });

  return NextResponse.json(link);
}
