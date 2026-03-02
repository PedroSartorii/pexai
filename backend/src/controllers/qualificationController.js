const prisma = require("../prisma");

const qualificationController = {
  async list(req, res) {
  try {
    const userId = req.userId;
    const qualifications = await prisma.qualification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(qualifications);
  } catch (err) {
    console.error("ERRO /qualifications:", err); // <- ver o erro real
    res.status(500).json({ message: "Erro ao listar qualificações." });
  }
},

  async create(req, res) {
    try {
      const userId = req.userId;
      const { nome, descricao, polo } = req.body;
      if (!nome || !polo) {
        return res.status(400).json({ message: "Nome e polo são obrigatórios." });
      }
      const qualification = await prisma.qualification.create({
        data: { userId, nome, descricao, polo },
      });
      res.status(201).json(qualification);
    } catch {
      res.status(500).json({ message: "Erro ao criar qualificação." });
    }
  },

  async update(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { nome, descricao, polo } = req.body;
      const result = await prisma.qualification.updateMany({
        where: { id, userId },
        data: { nome, descricao, polo },
      });
      if (result.count === 0)
        return res.status(404).json({ message: "Qualificação não encontrada." });
      res.json({ message: "Qualificação atualizada." });
    } catch {
      res.status(500).json({ message: "Erro ao atualizar qualificação." });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const result = await prisma.qualification.deleteMany({
        where: { id, userId },
      });
      if (result.count === 0)
        return res.status(404).json({ message: "Qualificação não encontrada." });
      res.json({ message: "Qualificação excluída." });
    } catch {
      res.status(500).json({ message: "Erro ao excluir qualificação." });
    }
  },
};

module.exports = qualificationController;