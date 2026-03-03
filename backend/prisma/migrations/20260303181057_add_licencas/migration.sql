-- CreateTable
CREATE TABLE "Licenca" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "usada" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativadaEm" TIMESTAMP(3),

    CONSTRAINT "Licenca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Licenca_codigo_key" ON "Licenca"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Licenca_userId_key" ON "Licenca"("userId");

-- AddForeignKey
ALTER TABLE "Licenca" ADD CONSTRAINT "Licenca_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
