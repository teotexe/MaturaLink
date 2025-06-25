import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, context: any) {
  const id = Number(context.params.id);
  const data = await req.json();

  if (!data.description || !data.macroargumentId || !data.argumentId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const updatedLink = await prisma.linkElement.update({
      where: { id },
      data: {
        description: data.description,
        macroargumentId: Number(data.macroargumentId),
        argumentId: Number(data.argumentId),
      },
      include: {
        macroargument: true,
      },
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    return NextResponse.json(
      { error: "Link not found or update failed" },
      { status: 404 }
    );
  }
}

export async function DELETE(req: NextRequest, context: any) {
  const id = Number(context.params.id);

  try {
    await prisma.linkElement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Link deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Link not found or delete failed" },
      { status: 404 }
    );
  }
}
