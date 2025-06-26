import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, context: any) {
  const param = await context.params;
  const id = Number(param.id);
  const data = await req.json();

  if (!data.description || !data.fromArgumentId || !data.toArgumentId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.argumentLink.update({
      where: { id },
      data: {
        description: data.description,
        fromArgumentId: Number(data.fromArgumentId),
        toArgumentId: Number(data.toArgumentId),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Argument link not found or update failed" },
      { status: 404 }
    );
  }
}

export async function DELETE(req: NextRequest, context: any) {
  const param = await context.params;
  const id = Number(param.id);

  try {
    await prisma.argumentLink.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Argument link deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Argument link not found or delete failed" },
      { status: 404 }
    );
  }
}
