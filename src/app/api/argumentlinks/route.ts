import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { description, fromArgumentId, toArgumentId } = data;

  if (!description || !fromArgumentId || !toArgumentId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const argLink = await prisma.argumentLink.create({
      data: {
        description,
        fromArgumentId: Number(fromArgumentId),
        toArgumentId: Number(toArgumentId),
      },
    });
    return NextResponse.json(argLink);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create argument link" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const links = await prisma.argumentLink.findMany({
    include: {
      fromArgument: true,
      toArgument: true,
    },
  });
  return NextResponse.json(links);
}
