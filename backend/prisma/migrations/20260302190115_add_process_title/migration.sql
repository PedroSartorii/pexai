-- CreateEnum
CREATE TYPE "AreaDireito" AS ENUM ('CIVIL', 'TRABALHISTA', 'PENAL', 'TRIBUTARIO', 'ADMINISTRATIVO', 'PREVIDENCIARIO', 'CONSUMIDOR', 'FAMILIA', 'EMPRESARIAL', 'AMBIENTAL', 'OUTROS');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateTable
CREATE TABLE "ProcessTitle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "areaDireito" "AreaDireito" NOT NULL,
    "prioridade" "Prioridade" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessTitle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProcessTitle" ADD CONSTRAINT "ProcessTitle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
