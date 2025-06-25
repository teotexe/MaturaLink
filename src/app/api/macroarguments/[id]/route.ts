import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adatta il path se necessario

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const macro = await prisma.macroargument.findUnique({ where: { id } });
  if (!macro) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(macro);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const param = await params;
  const id = Number(param.id);
  const { name } = await req.json();

  try {
    const updated = await prisma.macroargument.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const param = await params;
  const id = Number(param.id);

  try {
    // Scollega i LinkElement impostando macroargumentId a null
    await prisma.linkElement.updateMany({
      where: { macroargumentId: id },
      data: { macroargumentId: null },
    });

    // Ora cancella il Macroargument
    await prisma.macroargument.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Errore durante eliminazione" },
      { status: 400 }
    );
  }
}
