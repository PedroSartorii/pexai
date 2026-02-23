-- CreateTable
CREATE TABLE "Process" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "defendantName" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "vara" TEXT NOT NULL,
    "caseValue" DOUBLE PRECISION NOT NULL,
    "narrative" TEXT NOT NULL,
    "structuredData" JSONB NOT NULL,
    "generatedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
