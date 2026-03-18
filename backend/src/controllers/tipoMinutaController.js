const prisma = require("../prisma");
const path = require("path");
const fs = require("fs");

// ── list ──────────────────────────────────────────────────────────────────────
exports.list = async (req, res) => {
  try {
    const userId = req.userId;
    const tipos = await prisma.tipoMinuta.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(tipos);
  } catch (err) {
    console.error("ERRO GET /tipos-minuta:", err);
    res.status(500).json({ message: "Erro ao listar tipos de minuta." });
  }
};

// ── getOne ────────────────────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await prisma.tipoMinuta.findFirst({
      where: { id, userId: req.userId },
    });
    if (!tipo) return res.status(404).json({ message: "Tipo de minuta não encontrado." });
    res.json(tipo);
  } catch (err) {
    console.error("ERRO GET /tipos-minuta/:id:", err);
    res.status(500).json({ message: "Erro ao buscar tipo de minuta." });
  }
};

// ── create ────────────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const userId = req.userId;
    const { nome, descricao, prompt } = req.body;

    if (!nome?.trim()) return res.status(400).json({ message: "Nome é obrigatório." });
    if (!prompt?.trim()) return res.status(400).json({ message: "Prompt é obrigatório." });

    // Arquivo é opcional
    const nomeArquivo     = req.file?.originalname || null;
    const caminhoArquivo  = req.file?.path || null;
    const mimeType        = req.file?.mimetype || null;

    const tipo = await prisma.tipoMinuta.create({
      data: { userId, nome, descricao: descricao || null, prompt, nomeArquivo, caminhoArquivo, mimeType },
    });
    res.status(201).json(tipo);
  } catch (err) {
    console.error("ERRO POST /tipos-minuta:", err);
    res.status(500).json({ message: "Erro ao criar tipo de minuta." });
  }
};

// ── update ────────────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, prompt } = req.body;

    const existing = await prisma.tipoMinuta.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ message: "Tipo de minuta não encontrado." });

    // Se enviou novo arquivo, remove o antigo do disco
    let nomeArquivo    = existing.nomeArquivo;
    let caminhoArquivo = existing.caminhoArquivo;
    let mimeType       = existing.mimeType;

    if (req.file) {
      if (existing.caminhoArquivo && fs.existsSync(existing.caminhoArquivo)) {
        fs.unlinkSync(existing.caminhoArquivo);
      }
      nomeArquivo    = req.file.originalname;
      caminhoArquivo = req.file.path;
      mimeType       = req.file.mimetype;
    }

    const tipo = await prisma.tipoMinuta.update({
      where: { id },
      data: {
        nome: nome ?? existing.nome,
        descricao: descricao ?? existing.descricao,
        prompt: prompt ?? existing.prompt,
        nomeArquivo,
        caminhoArquivo,
        mimeType,
      },
    });
    res.json(tipo);
  } catch (err) {
    console.error("ERRO PUT /tipos-minuta/:id:", err);
    res.status(500).json({ message: "Erro ao atualizar tipo de minuta." });
  }
};

// ── remove ────────────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.tipoMinuta.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ message: "Tipo de minuta não encontrado." });

    // Remove arquivo do disco se existir
    if (existing.caminhoArquivo && fs.existsSync(existing.caminhoArquivo)) {
      fs.unlinkSync(existing.caminhoArquivo);
    }

    await prisma.tipoMinuta.delete({ where: { id } });
    res.json({ message: "Tipo de minuta excluído." });
  } catch (err) {
    console.error("ERRO DELETE /tipos-minuta/:id:", err);
    res.status(500).json({ message: "Erro ao excluir tipo de minuta." });
  }
};

// ── download do modelo ────────────────────────────────────────────────────────
exports.downloadModelo = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await prisma.tipoMinuta.findFirst({ where: { id, userId: req.userId } });
    if (!tipo) return res.status(404).json({ message: "Tipo de minuta não encontrado." });
    if (!tipo.caminhoArquivo) return res.status(404).json({ message: "Nenhum modelo anexado." });
    if (!fs.existsSync(tipo.caminhoArquivo)) return res.status(404).json({ message: "Arquivo não encontrado no servidor." });

    res.download(tipo.caminhoArquivo, tipo.nomeArquivo);
  } catch (err) {
    console.error("ERRO GET /tipos-minuta/:id/modelo:", err);
    res.status(500).json({ message: "Erro ao baixar modelo." });
  }
};