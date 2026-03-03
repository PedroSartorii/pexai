const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.enviarEmailResetSenha = async ({ email, nome, token }) => {
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: email,
    subject: "Redefinição de senha — PexAI",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:48px 24px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111118;border:1px solid rgba(212,175,55,0.2);border-radius:4px;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td style="padding:32px 40px;border-bottom:1px solid rgba(212,175,55,0.1);">
                      <p style="margin:0;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#d4af37;">
                        PexAI — Sistema Jurídico
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;color:#f0e6c8;line-height:1.3;">
                        Redefinição de senha
                      </h1>
                      <p style="margin:0 0 12px;font-size:14px;color:#888;line-height:1.7;font-weight:300;">
                        Olá, <strong style="color:#ccc;font-weight:400;">${nome}</strong>.
                      </p>
                      <p style="margin:0 0 32px;font-size:14px;color:#888;line-height:1.7;font-weight:300;">
                        Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha. Este link expira em <strong style="color:#d4af37;">1 hora</strong>.
                      </p>

                      <!-- Botão -->
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="border-radius:2px;background:transparent;border:1px solid rgba(212,175,55,0.4);">
                            <a href="${link}" target="_blank"
                              style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#d4af37;text-decoration:none;">
                              Redefinir Senha
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:32px 0 0;font-size:12px;color:#444;line-height:1.7;">
                        Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanece a mesma.
                      </p>
                    </td>
                  </tr>

                  <!-- Link alternativo -->
                  <tr>
                    <td style="padding:20px 40px 32px;">
                      <p style="margin:0 0 8px;font-size:11px;color:#444;">
                        Ou copie e cole este link no navegador:
                      </p>
                      <p style="margin:0;font-size:11px;color:#666;word-break:break-all;">
                        ${link}
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
                      <p style="margin:0;font-size:11px;color:#333;text-align:center;">
                        © ${new Date().getFullYear()} PexAI · Todos os direitos reservados
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};