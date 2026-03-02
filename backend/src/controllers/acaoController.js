const prisma = require("../prisma");

const acaoController = {
  async list(req, res) {
    try {
      const userId = req.userId;
      const acoes = await prisma.acao.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      res.json(acoes);
    } catch (err) {
      console.error("ERRO /acoes:", err);
      res.status(500).json({ message: "Erro ao listar ações." });
    }
  },

  async create(req, res) {
    try {
      const userId = req.userId;
      const { nomeAcao, fundamentacao, valorCausa, rito } = req.body;
      if (!nomeAcao || !rito) {
        return res.status(400).json({ message: "Nome da ação e rito são obrigatórios." });
      }
      const acao = await prisma.acao.create({
        data: {
          userId, nomeAcao, fundamentacao, rito,
          valorCausa: valorCausa ? parseFloat(valorCausa) : null,
        },
      });
      res.status(201).json(acao);
    } catch (err) {
      console.error("ERRO /acoes:", err);
      res.status(500).json({ message: "Erro ao criar ação." });
    }
  },

  async update(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { nomeAcao, fundamentacao, valorCausa, rito } = req.body;
      const result = await prisma.acao.updateMany({
        where: { id, userId },
        data: {
          nomeAcao, fundamentacao, rito,
          valorCausa: valorCausa ? parseFloat(valorCausa) : null,
        },
      });
      if (result.count === 0)
        return res.status(404).json({ message: "Ação não encontrada." });
      res.json({ message: "Ação atualizada." });
    } catch (err) {
      console.error("ERRO /acoes:", err);
      res.status(500).json({ message: "Erro ao atualizar ação." });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const result = await prisma.acao.deleteMany({
        where: { id, userId },
      });
      if (result.count === 0)
        return res.status(404).json({ message: "Ação não encontrada." });
      res.json({ message: "Ação excluída." });
    } catch (err) {
      console.error("ERRO /acoes:", err);
      res.status(500).json({ message: "Erro ao excluir ação." });
    }
  },
};

module.exports = acaoController;