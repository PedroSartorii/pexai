const prisma = require("../prisma");

const juizoController = {
  async list(req, res) {
    try {
      const userId = req.userId;
      const juizos = await prisma.juizo.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      res.json(juizos);
    } catch (err) {
      console.error("ERRO /juizos:", err);
      res.status(500).json({ message: "Erro ao listar juízos." });
    }
  },

  async create(req, res) {
    try {
      const userId = req.userId;
      const { tribunal, comarca, instancia, orgaoJulgador, cep, logradouro, numero, complemento, bairro, cidade, uf } = req.body;
      if (!tribunal || !comarca || !instancia || !orgaoJulgador) {
        return res.status(400).json({ message: "Tribunal, comarca, instância e órgão julgador são obrigatórios." });
      }
      const juizo = await prisma.juizo.create({
        data: { userId, tribunal, comarca, instancia, orgaoJulgador, cep, logradouro, numero, complemento, bairro, cidade, uf },
      });
      res.status(201).json(juizo);
    } catch (err) {
      console.error("ERRO /juizos:", err);
      res.status(500).json({ message: "Erro ao criar juízo." });
    }
  },

  async update(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const result = await prisma.juizo.updateMany({
        where: { id, userId },
        data: req.body,
      });
      if (result.count === 0)
        return res.status(404).json({ message: "Juízo não encontrado." });
      res.json({ message: "Juízo atualizado." });
    } catch (err) {
      console.error("ERRO /juizos:", err);
      res.status(500).json({ message: "Erro ao atualizar juízo." });
    }
  },

  async remove(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const result = await prisma.juizo.deleteMany({
        where: { id, userId },
      });
      if (result.count === 0)
        return res.status(404).json({ message: "Juízo não encontrado." });
      res.json({ message: "Juízo excluído." });
    } catch (err) {
      console.error("ERRO /juizos:", err);
      res.status(500).json({ message: "Erro ao excluir juízo." });
    }
  },
};

module.exports = juizoController;