-- CreateTable
CREATE TABLE "TipoMinuta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "prompt" TEXT NOT NULL,
    "nomeArquivo" TEXT,
    "caminhoArquivo" TEXT,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoMinuta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TipoMinuta" ADD CONSTRAINT "TipoMinuta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
