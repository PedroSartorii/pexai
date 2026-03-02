const prisma = require("../prisma");

exports.createClient = async (req, res) => {
  try {
    const {
      tipoPessoa,
      nome,
      cpfCnpj,
      rgInscricaoEstadual,
      estadoCivil,
      profissao,
      email,
      telefoneCelular,
      telefoneFixo,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      dadosBancarios,
    } = req.body;

    if (!nome || !cpfCnpj) {
      return res.status(400).json({ error: "Nome e CPF/CNPJ são obrigatórios." });
    }

    const client = await prisma.client.create({
      data: {
        userId: req.userId,
        tipoPessoa,
        nome,
        cpfCnpj,
        rgInscricaoEstadual,
        estadoCivil,
        profissao,
        email,
        telefoneCelular,
        telefoneFixo,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        dadosBancarios: dadosBancarios || null,
      },
    });

    res.status(201).json({ message: "Cliente criado com sucesso.", client });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({ error: "Erro interno ao criar cliente." });
  }
};

exports.listClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({ error: "Erro interno ao listar clientes." });
  }
};

exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findFirst({ where: { id, userId: req.userId } });
    if (!client) return res.status(404).json({ error: "Cliente não encontrado." });
    res.json(client);
  } catch (error) {
    console.error("Erro ao obter cliente:", error);
    res.status(500).json({ error: "Erro interno ao obter cliente." });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const existing = await prisma.client.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: "Cliente não encontrado." });
    const client = await prisma.client.update({ where: { id }, data });
    res.json({ message: "Cliente atualizado.", client });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).json({ error: "Erro interno ao atualizar cliente." });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.client.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: "Cliente não encontrado." });
    await prisma.client.delete({ where: { id } });
    res.json({ message: "Cliente removido." });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    res.status(500).json({ error: "Erro interno ao excluir cliente." });
  }
};
