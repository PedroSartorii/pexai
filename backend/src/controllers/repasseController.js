const prisma = require("../prisma");

exports.list = async (req, res) => {
  try {
    const repassess = await prisma.repasse.findMany({
      where: { processo: { userId: req.userId } },
      include: { processo: { select: { id: true, titulo: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(repassess);
  } catch (err) {
    console.error("ERRO /repassess:", err);
    res.status(500).json({ message: "Erro ao listar repassess." });
  }
};

exports.create = async (req, res) => {
  try {
    const { processoId, parceiro, percentual, pago } = req.body;
    if (!processoId || !parceiro || !percentual)
      return res.status(400).json({ message: "Campos obrigatórios faltando." });

    const processo = await prisma.processo.findFirst({ where: { id: processoId, userId: req.userId } });
    if (!processo) return res.status(404).json({ message: "Processo não encontrado." });

    const repasse = await prisma.repasse.create({
      data: { processoId, parceiro, percentual: parseFloat(percentual), pago: pago || false },
      include: { processo: { select: { id: true, titulo: true } } },
    });
    res.status(201).json(repasse);
  } catch (err) {
    console.error("ERRO POST /repassess:", err);
    res.status(500).json({ message: "Erro ao criar repasse." });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { processoId, parceiro, percentual, pago } = req.body;

    const existing = await prisma.repasse.findFirst({
      where: { id, processo: { userId: req.userId } },
    });
    if (!existing) return res.status(404).json({ message: "Repasse não encontrado." });

    const repasse = await prisma.repasse.update({
      where: { id },
      data: { processoId, parceiro, percentual: parseFloat(percentual), pago },
      include: { processo: { select: { id: true, titulo: true } } },
    });
    res.json(repasse);
  } catch (err) {
    console.error("ERRO PUT /repassess:", err);
    res.status(500).json({ message: "Erro ao atualizar repasse." });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.repasse.findFirst({
      where: { id, processo: { userId: req.userId } },
    });
    if (!existing) return res.status(404).json({ message: "Repasse não encontrado." });
    await prisma.repasse.delete({ where: { id } });
    res.json({ message: "Repasse excluído." });
  } catch (err) {
    console.error("ERRO DELETE /repassess:", err);
    res.status(500).json({ message: "Erro ao excluir repasse." });
  }
};