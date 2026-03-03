require("dotenv").config();
const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const crypto = require("crypto");
const { enviarEmailResetSenha } = require("../services/emailService");

exports.register = async (req, res) => {
  try {
    const { name, email, password, codigoLicenca } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    if (!codigoLicenca) {
      return res.status(400).json({ error: "Código de licença obrigatório." });
    }

    // Verificar se email já existe
    const emailExiste = await prisma.user.findUnique({ where: { email } });
    if (emailExiste) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }

    // Verificar licença
    const licenca = await prisma.licenca.findUnique({
      where: { codigo: codigoLicenca.toUpperCase().trim() },
    });

    if (!licenca) {
      return res.status(400).json({ error: "Licença inválida." });
    }

    if (licenca.usada) {
      return res.status(400).json({ error: "Esta licença já foi utilizada." });
    }

    // Criar usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Vincular licença ao usuário
    await prisma.licenca.update({
      where: { id: licenca.id },
      data: {
        usada: true,
        userId: user.id,
        ativadaEm: new Date(),
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("ERRO /register:", err);
    res.status(500).json({ error: "Erro ao criar conta." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Senha inválida" });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erro interno" });
  }
};

// ─── Solicitar reset de senha ─────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "E-mail é obrigatório." });

    const user = await prisma.user.findUnique({ where: { email } });

    // Sempre retorna sucesso para não revelar se o e-mail existe
    if (!user) {
      return res.json({ message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve." });
    }

    // Gera token seguro
    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    await enviarEmailResetSenha({
      email: user.email,
      nome:  user.name,
      token,
    });

    res.json({ message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve." });
  } catch (err) {
    console.error("ERRO /forgot-password:", err);
    res.status(500).json({ message: "Erro ao processar solicitação." });
  }
};

// ─── Redefinir senha ──────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha) return res.status(400).json({ message: "Token e nova senha são obrigatórios." });
    if (novaSenha.length < 6) return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // token ainda válido
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido ou expirado. Solicite um novo link." });
    }

    const hash = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Senha redefinida com sucesso! Faça login com sua nova senha." });
  } catch (err) {
    console.error("ERRO /reset-password:", err);
    res.status(500).json({ message: "Erro ao redefinir senha." });
  }
};