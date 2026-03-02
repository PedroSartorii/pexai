-- CreateEnum
CREATE TYPE "RitoProcessual" AS ENUM ('COMUM', 'SUMARISSIMO', 'ESPECIAL');

-- CreateTable
CREATE TABLE "Acao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nomeAcao" TEXT NOT NULL,
    "fundamentacao" TEXT,
    "valorCausa" DOUBLE PRECISION,
    "rito" "RitoProcessual" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Acao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Acao" ADD CONSTRAINT "Acao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
