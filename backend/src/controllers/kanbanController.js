const prisma = require("../prisma");

exports.list = async (req, res) => {
  try {
    const userId = req.userId;
    const cards = await prisma.kanbanCard.findMany({
      where: { userId },
      include: { processo: { select: { id: true, titulo: true, numeroProcesso: true } } },
      orderBy: [{ coluna: "asc" }, { ordem: "asc" }],
    });
    res.json(cards);
  } catch (err) {
    console.error("ERRO /kanban:", err);
    res.status(500).json({ message: "Erro ao listar cards." });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.userId;
    const { titulo, descricao, coluna, prioridade, prazoFatal, responsavel, processoId } = req.body;
    if (!titulo) return res.status(400).json({ message: "Título é obrigatório." });

    // Pega a maior ordem da coluna para inserir no final
    const maxOrdem = await prisma.kanbanCard.aggregate({
      where: { userId, coluna: coluna || "BACKLOG" },
      _max: { ordem: true },
    });

    const card = await prisma.kanbanCard.create({
      data: {
        userId, titulo, descricao,
        coluna: coluna || "BACKLOG",
        prioridade: prioridade || "AZUL",
        prazoFatal: prazoFatal ? new Date(prazoFatal) : null,
        responsavel,
        processoId: processoId || null,
        ordem: (maxOrdem._max.ordem ?? -1) + 1,
      },
      include: { processo: { select: { id: true, titulo: true, numeroProcesso: true } } },
    });
    res.status(201).json(card);
  } catch (err) {
    console.error("ERRO POST /kanban:", err);
    res.status(500).json({ message: "Erro ao criar card." });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { titulo, descricao, coluna, prioridade, prazoFatal, responsavel, processoId, ordem } = req.body;

    const existing = await prisma.kanbanCard.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: "Card não encontrado." });

    const card = await prisma.kanbanCard.update({
      where: { id },
      data: {
        titulo, descricao, coluna, prioridade,
        prazoFatal: prazoFatal ? new Date(prazoFatal) : null,
        responsavel,
        processoId: processoId || null,
        ordem: ordem ?? existing.ordem,
      },
      include: { processo: { select: { id: true, titulo: true, numeroProcesso: true } } },
    });
    res.json(card);
  } catch (err) {
    console.error("ERRO PUT /kanban:", err);
    res.status(500).json({ message: "Erro ao atualizar card." });
  }
};

exports.mover = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { coluna, ordem } = req.body;

    const existing = await prisma.kanbanCard.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: "Card não encontrado." });

    const card = await prisma.kanbanCard.update({
      where: { id },
      data: { coluna, ordem: ordem ?? 0 },
    });
    res.json(card);
  } catch (err) {
    console.error("ERRO PATCH /kanban/mover:", err);
    res.status(500).json({ message: "Erro ao mover card." });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const result = await prisma.kanbanCard.deleteMany({ where: { id, userId } });
    if (result.count === 0) return res.status(404).json({ message: "Card não encontrado." });
    res.json({ message: "Card excluído." });
  } catch (err) {
    console.error("ERRO DELETE /kanban:", err);
    res.status(500).json({ message: "Erro ao excluir card." });
  }
};