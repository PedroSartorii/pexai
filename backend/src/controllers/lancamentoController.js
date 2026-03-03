const prisma = require("../prisma");

exports.list = async (req, res) => {
  try {
    const userId = req.userId;
    const lancamentos = await prisma.lancamento.findMany({
      where: { processo: { userId } },
      include: { processo: { select: { id: true, titulo: true } } },
      orderBy: { dataVencimento: "asc" },
    });
    res.json(lancamentos);
  } catch (err) {
    console.error("ERRO /lancamentos:", err);
    res.status(500).json({ message: "Erro ao listar lançamentos." });
  }
};

exports.create = async (req, res) => {
  try {
    const { processoId, valorTotal, status, dataVencimento, dataRecebimento, descricao } = req.body;
    if (!processoId || !valorTotal || !dataVencimento)
      return res.status(400).json({ message: "Campos obrigatórios faltando." });

    // Verifica se o processo pertence ao usuário
    const processo = await prisma.processo.findFirst({ where: { id: processoId, userId: req.userId } });
    if (!processo) return res.status(404).json({ message: "Processo não encontrado." });

    const lancamento = await prisma.lancamento.create({
      data: {
        processoId,
        valorTotal: parseFloat(valorTotal),
        status: status || "PENDENTE",
        dataVencimento: new Date(dataVencimento),
        dataRecebimento: dataRecebimento ? new Date(dataRecebimento) : null,
        descricao,
      },
      include: { processo: { select: { id: true, titulo: true } } },
    });
    res.status(201).json(lancamento);
  } catch (err) {
    console.error("ERRO POST /lancamentos:", err);
    res.status(500).json({ message: "Erro ao criar lançamento." });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { valorTotal, status, dataVencimento, dataRecebimento, descricao, processoId } = req.body;

    const existing = await prisma.lancamento.findFirst({
      where: { id, processo: { userId: req.userId } },
    });
    if (!existing) return res.status(404).json({ message: "Lançamento não encontrado." });

    const lancamento = await prisma.lancamento.update({
      where: { id },
      data: {
        processoId,
        valorTotal: parseFloat(valorTotal),
        status,
        dataVencimento: new Date(dataVencimento),
        dataRecebimento: dataRecebimento ? new Date(dataRecebimento) : null,
        descricao,
      },
      include: { processo: { select: { id: true, titulo: true } } },
    });
    res.json(lancamento);
  } catch (err) {
    console.error("ERRO PUT /lancamentos:", err);
    res.status(500).json({ message: "Erro ao atualizar lançamento." });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.lancamento.findFirst({
      where: { id, processo: { userId: req.userId } },
    });
    if (!existing) return res.status(404).json({ message: "Lançamento não encontrado." });
    await prisma.lancamento.delete({ where: { id } });
    res.json({ message: "Lançamento excluído." });
  } catch (err) {
    console.error("ERRO DELETE /lancamentos:", err);
    res.status(500).json({ message: "Erro ao excluir lançamento." });
  }
};