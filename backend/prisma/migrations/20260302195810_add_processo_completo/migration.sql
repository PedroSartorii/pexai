-- CreateEnum
CREATE TYPE "AcessoType" AS ENUM ('PUBLICO', 'PRIVADO', 'ENVOLVIDOS');

-- CreateEnum
CREATE TYPE "CustoTipo" AS ENUM ('CUSTAS', 'HONORARIOS', 'PERICIA', 'DILIGENCIA', 'OUTROS');

-- CreateTable
CREATE TABLE "Processo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pasta" TEXT,
    "titulo" TEXT NOT NULL,
    "numeroProcesso" TEXT,
    "linkTribunal" TEXT,
    "objeto" TEXT,
    "valorCausa" DOUBLE PRECISION,
    "distribuidoEm" TIMESTAMP(3),
    "valorCondenacao" DOUBLE PRECISION,
    "observacoes" TEXT,
    "responsavel" TEXT,
    "acesso" "AcessoType" NOT NULL DEFAULT 'PRIVADO',
    "movimentacao" TEXT,
    "honorarios" TEXT,
    "parcerias" TEXT,
    "prazos" TEXT,
    "generatedText" TEXT,
    "juizoId" TEXT,
    "juizoLivre" TEXT,
    "acaoId" TEXT,
    "acaoLivre" TEXT,
    "instancia" "Instancia",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Processo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessoCliente" (
    "id" TEXT NOT NULL,
    "processoId" TEXT NOT NULL,
    "clienteId" TEXT,
    "clienteLivre" TEXT,
    "qualificacaoId" TEXT,
    "qualLivre" TEXT,

    CONSTRAINT "ProcessoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessoEnvolvido" (
    "id" TEXT NOT NULL,
    "processoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" TEXT,
    "documento" TEXT,
    "contato" TEXT,

    CONSTRAINT "ProcessoEnvolvido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustoProcessual" (
    "id" TEXT NOT NULL,
    "processoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" "CustoTipo" NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustoProcessual_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Processo" ADD CONSTRAINT "Processo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Processo" ADD CONSTRAINT "Processo_juizoId_fkey" FOREIGN KEY ("juizoId") REFERENCES "Juizo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Processo" ADD CONSTRAINT "Processo_acaoId_fkey" FOREIGN KEY ("acaoId") REFERENCES "Acao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessoCliente" ADD CONSTRAINT "ProcessoCliente_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessoCliente" ADD CONSTRAINT "ProcessoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessoCliente" ADD CONSTRAINT "ProcessoCliente_qualificacaoId_fkey" FOREIGN KEY ("qualificacaoId") REFERENCES "Qualification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessoEnvolvido" ADD CONSTRAINT "ProcessoEnvolvido_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustoProcessual" ADD CONSTRAINT "CustoProcessual_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
