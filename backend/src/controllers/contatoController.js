const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.vendas = async (req, res) => {
  try {
    const { nome, telefone, email } = req.body;
    if (!nome || !telefone || !email) {
      return res.status(400).json({ message: "Nome, telefone e e-mail são obrigatórios." });
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: "sartoriurnau@gmail.com",
      subject: `Novo lead PexAI — ${nome}`,
      html: `
        <div style="background:#0a0a0f;padding:48px 24px;font-family:Arial,sans-serif;">
          <div style="max-width:520px;margin:0 auto;background:#111118;border:1px solid rgba(212,175,55,0.2);border-radius:4px;overflow:hidden;">
            <div style="padding:24px 36px;border-bottom:1px solid rgba(212,175,55,0.1);">
              <p style="margin:0;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#d4af37;">PexAI — Novo Lead</p>
            </div>
            <div style="padding:36px;">
              <h1 style="margin:0 0 28px;font-size:22px;font-weight:300;color:#f0e6c8;">Novo interesse no Plano Pro</h1>

              <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;">Nome</p>
              <p style="margin:0 0 20px;font-size:16px;color:#f0e6c8;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.05);">${nome}</p>

              <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;">Telefone</p>
              <p style="margin:0 0 20px;font-size:16px;color:#f0e6c8;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.05);">${telefone}</p>

              <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;">E-mail</p>
              <p style="margin:0;font-size:16px;color:#d4af37;">${email}</p>
            </div>
            <div style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:11px;color:#333;text-align:center;">© ${new Date().getFullYear()} PexAI · Todos os direitos reservados</p>
            </div>
          </div>
        </div>
      `,
    });

    res.json({ message: "Contato registrado com sucesso." });
  } catch (err) {
    console.error("ERRO /contato/vendas:", err);
    res.status(500).json({ message: "Erro ao enviar contato." });
  }
};