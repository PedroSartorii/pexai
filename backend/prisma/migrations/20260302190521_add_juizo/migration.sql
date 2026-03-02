-- CreateEnum
CREATE TYPE "Instancia" AS ENUM ('PRIMEIRA', 'SEGUNDA', 'SUPERIOR');

-- CreateTable
CREATE TABLE "Juizo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tribunal" TEXT NOT NULL,
    "comarca" TEXT NOT NULL,
    "instancia" "Instancia" NOT NULL,
    "orgaoJulgador" TEXT NOT NULL,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Juizo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Juizo" ADD CONSTRAINT "Juizo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
