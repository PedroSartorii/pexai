/**
 * controllers/processController.js  (VERSÃO CORRIGIDA)
 *
 * Correção aplicada:
 *   - Dados reais (authorName, defendantName, cpfCnpj) são anonimizados
 *     ANTES de serem enviados ao Gemini via generateLegalText().
 *   - Após a geração, os tokens são substituídos de volta pelos valores reais
 *     no texto final que é salvo no banco.
 *
 * Isso resolve a falha LGPD Art. 33 (transferência internacional de dados pessoais).
 */

const prisma = require("../prisma");
const { generateLegalText } = require("../services/aiService");
const { generateDocx } = require("../utils/docxGenerator");
const { anonymizeForAI, restoreFromAI } = require("../utils/anonymize"); // ← NOVO

exports.createProcess = async (req, res) => {
  try {
    const { authorName, defendantName, cpfCnpj, vara, caseValue, narrative } = req.body;

    if (!authorName || !defendantName || !cpfCnpj || !vara || !caseValue || !narrative) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const structuredData = { authorName, defendantName, cpfCnpj, vara, caseValue };

    // ── CORREÇÃO: anonimizar antes de enviar à IA ──────────────────────────────
    const { anonymized, mapping } = anonymizeForAI({
      authorName,
      defendantName,
      cpfCnpj,
      vara,
      caseValue,
      narrative,
    });

    // A IA recebe dados sem PII real — nomes e CPF substituídos por tokens
    const rawGeneratedText = await generateLegalText(anonymized);

    // Restaura os dados reais no texto APÓS retorno da IA
    // O texto final salvo no banco contém os valores corretos
    const generatedText = restoreFromAI(rawGeneratedText, mapping);
    // ── FIM DA CORREÇÃO ────────────────────────────────────────────────────────

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
    console.error("ERRO MENSAGEM:", error.message);
    console.error("ERRO COMPLETO:", error);
    console.error("Erro ao criar processo:", error);
    res.status(500).json({ error: "Erro interno ao criar processo." });
  }
};

// ── Demais métodos sem alteração ───────────────────────────────────────────────

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
