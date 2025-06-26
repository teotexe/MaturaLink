-- CreateTable
CREATE TABLE "ArgumentLink" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "fromArgumentId" INTEGER NOT NULL,
    "toArgumentId" INTEGER NOT NULL,

    CONSTRAINT "ArgumentLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArgumentLink" ADD CONSTRAINT "ArgumentLink_fromArgumentId_fkey" FOREIGN KEY ("fromArgumentId") REFERENCES "ArgumentElement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArgumentLink" ADD CONSTRAINT "ArgumentLink_toArgumentId_fkey" FOREIGN KEY ("toArgumentId") REFERENCES "ArgumentElement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
