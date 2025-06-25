import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const macros = await prisma.macroargument.findMany();
  return NextResponse.json(macros);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const macro = await prisma.macroargument.create({ data: { name } });
  return NextResponse.json(macro);
}
