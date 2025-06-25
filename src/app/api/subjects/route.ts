import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const subjects = await prisma.subject.findMany();
  return NextResponse.json(subjects);
}
