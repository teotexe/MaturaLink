import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const argument = await prisma.argumentElement.create({
    data: {
      title: data.title,
      description: data.description,
      subject: { connect: { name: data.subjectName } },
    },
  });
  return NextResponse.json(argument);
}

export async function GET() {
  const argumentsWithLinks = await prisma.argumentElement.findMany({
    include: {
      subject: true,
      links: {
        include: {
          macroargument: true,
        },
      },
    },
  });

  return NextResponse.json(argumentsWithLinks);
}
