-- CreateEnum
CREATE TYPE "KanbanColuna" AS ENUM ('BACKLOG', 'TRIAGEM', 'PRODUCAO', 'REVISAO', 'AGUARDANDO', 'PROTOCOLO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "KanbanPrioridade" AS ENUM ('VERMELHO', 'AMARELO', 'VERDE', 'AZUL');

-- CreateTable
CREATE TABLE "KanbanCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "coluna" "KanbanColuna" NOT NULL DEFAULT 'BACKLOG',
    "prioridade" "KanbanPrioridade" NOT NULL DEFAULT 'AZUL',
    "prazoFatal" TIMESTAMP(3),
    "responsavel" TEXT,
    "processoId" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KanbanCard" ADD CONSTRAINT "KanbanCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanCard" ADD CONSTRAINT "KanbanCard_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
