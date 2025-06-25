import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, context: any) {
  const id = Number(context.params.id);
  const data = await req.json();

  const updatedArgument = await prisma.argumentElement.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      subject: { connect: { name: data.subjectName } },
    },
    include: {
      subject: true,
      links: {
        include: {
          macroargument: true,
        },
      },
    },
  });

  return NextResponse.json(updatedArgument);
}

export async function GET(req: NextRequest, context: any) {
  const id = Number(context.params.id);
  const argument = await prisma.argumentElement.findUnique({
    where: { id },
    include: {
      subject: true,
      links: { include: { macroargument: true } },
    },
  });

  if (!argument) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(argument);
}

export async function DELETE(req: NextRequest, context: any) {
  const id = Number(context.params.id);

  try {
    // Delete all links related to this argument first (optional if cascading deletes configured)
    await prisma.linkElement.deleteMany({
      where: { argumentId: id },
    });

    // Delete the argument itself
    await prisma.argumentElement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Argument deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete argument" },
      { status: 500 }
    );
  }
}
