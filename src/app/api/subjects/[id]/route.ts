import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  const param = await context.params;
  const id = Number(param.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid subject id" }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  return NextResponse.json(subject);
}

export async function PATCH(request: NextRequest, context: any) {
  const param = await context.params;
  const id = Number(param.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid subject id" }, { status: 400 });
  }

  const body = await request.json();
  const { name, color } = body;

  if (!name && !color) {
    return NextResponse.json(
      { error: "Must provide at least one of name or color" },
      { status: 400 }
    );
  }

  try {
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(color ? { color } : {}),
      },
    });

    return NextResponse.json(updatedSubject);
  } catch (error) {
    // Possible unique constraint violation on name
    return NextResponse.json(
      { error: "Failed to update subject. Name might be duplicate." },
      { status: 400 }
    );
  }
}
