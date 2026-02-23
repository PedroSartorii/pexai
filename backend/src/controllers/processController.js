const prisma = require("../prisma");
const { generateLegalText } = require("../services/aiService");
const { generateDocx } = require("../utils/docxGenerator");

exports.createProcess = async (req, res) => {
  try {
    const { authorName, defendantName, cpfCnpj, vara, caseValue, narrative } = req.body;

    if (!authorName || !defendantName || !cpfCnpj || !vara || !caseValue || !narrative) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const structuredData = { authorName, defendantName, cpfCnpj, vara, caseValue };

    const generatedText = await generateLegalText({
      authorName,
      defendantName,
      cpfCnpj,
      vara,
      caseValue,
      narrative,
    });

    const process = await prisma.process.create({
      data: {
        userId: req.userId,
        authorName,
        defendantName,
        cpfCnpj,
        vara,
        caseValue: parseFloat(caseValue),
        narrative,
        structuredData,
        generatedText,
      },
    });

    res.status(201).json({ message: "Processo criado com sucesso.", process });
  } catch (error) {
    console.error("Erro ao criar processo:", error);
    res.status(500).json({ error: "Erro interno ao criar processo." });
  }
};

exports.listProcesses = async (req, res) => {
  try {
    const processes = await prisma.process.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        defendantName: true,
        cpfCnpj: true,
        vara: true,
        caseValue: true,
        createdAt: true,
      },
    });

    res.json(processes);
  } catch (error) {
    console.error("Erro ao listar processos:", error);
    res.status(500).json({ error: "Erro interno ao listar processos." });
  }
};

exports.downloadDocx = async (req, res) => {
  try {
    const { id } = req.params;

    const process = await prisma.process.findFirst({
      where: { id, userId: req.userId },
    });

    if (!process) {
      return res.status(404).json({ error: "Processo não encontrado." });
    }

    const buffer = await generateDocx(process.generatedText);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="processo-${id}.docx"`);
    res.send(buffer);
  } catch (error) {
    console.error("Erro ao gerar DOCX:", error);
    res.status(500).json({ error: "Erro interno ao gerar documento." });
  }
};