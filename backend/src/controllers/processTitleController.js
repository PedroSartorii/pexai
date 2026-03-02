const prisma = require("../prisma");

const processTitleController = {
  async list(req, res) {
    try {
      const userId = req.userId;
      const titles = await prisma.processTitle.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      res.json(titles);
    } catch (err) {
      console.error("ERRO /process-titles:", err);
      res.status(500).json({ message: "Erro ao listar títulos." });
    }
  },

  async create(req, res) {
    try {
      const userId = req.userId;
      const { titulo, areaDireito, prioridade } = req.body;
      if (!titulo || !areaDireito || !prioridade) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
      }
      const title = await prisma.processTitle.create({
        data: { userId, titulo, areaDireito, prioridade },
      });
      res.status(201).json(title);
    } catch (err) {
      console.error("ERRO /process-titles:", err);
      res.status(500).json({ message: "Erro ao criar título." });
    }
  },

  async update(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { titulo, areaDireito, prioridade } = req.body;
      const result = await prisma.processTitle.updateMany({
        where: { id, userId },
        data: { titulo, areaDireito, prioridade },
      });
      if (result.count === 0)
        return res.status(404).json({ message: "Título não encontrado." });
      res.json({ message: "Título atualizado." });
    } catch (err) {
      console.error("ERRO /process-titles:", err);
      res.status(500).json({ message: "Erro ao atualizar título." });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const result = await prisma.processTitle.deleteMany({
        where: { id, userId },
      });
      if (result.count === 0)
        return res.status(404).json({ message: "Título não encontrado." });
      res.json({ message: "Título excluído." });
    } catch (err) {
      console.error("ERRO /process-titles:", err);
      res.status(500).json({ message: "Erro ao excluir título." });
    }
  },
};

module.exports = processTitleController;