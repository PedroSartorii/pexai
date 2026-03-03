const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

// Gera código no formato PEXAI-XXXX-XXXX-XXXX
function gerarCodigo() {
  const parte = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `PEXAI-${parte()}-${parte()}-${parte()}`;
}

// POST /admin/licencas — gerar nova licença
exports.gerar = async (req, res) => {
  try {
    const { adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    const codigo = gerarCodigo();

    const licenca = await prisma.licenca.create({
      data: { codigo },
    });

    res.json({ codigo: licenca.codigo, id: licenca.id });
  } catch (err) {
    console.error("ERRO /admin/licencas:", err);
    res.status(500).json({ message: "Erro ao gerar licença." });
  }
};

// POST /admin/licencas/listar — ver todas
exports.listar = async (req, res) => {
  try {
    const { adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    const licencas = await prisma.licenca.findMany({
      orderBy: { criadaEm: "desc" },
      include: { usadaPor: { select: { name: true, email: true } } },
    });

    res.json(licencas);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar licenças." });
  }
};