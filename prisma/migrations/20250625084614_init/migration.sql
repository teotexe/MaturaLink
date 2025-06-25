-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#cccccc',

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Macroargument" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Macroargument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArgumentElement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "ArgumentElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkElement" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "argumentId" INTEGER NOT NULL,
    "macroargumentId" INTEGER NOT NULL,

    CONSTRAINT "LinkElement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Macroargument_name_key" ON "Macroargument"("name");

-- AddForeignKey
ALTER TABLE "ArgumentElement" ADD CONSTRAINT "ArgumentElement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkElement" ADD CONSTRAINT "LinkElement_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "ArgumentElement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkElement" ADD CONSTRAINT "LinkElement_macroargumentId_fkey" FOREIGN KEY ("macroargumentId") REFERENCES "Macroargument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
