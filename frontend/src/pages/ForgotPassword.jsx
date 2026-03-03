import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) { setError("Informe seu e-mail."); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao enviar e-mail.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: "#d4af37", marginBottom: 8 }}>PexAI</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: "#f0e6c8" }}>
            {enviado ? "E-mail enviado" : "Esqueceu a senha?"}
          </h1>
          <p style={{ fontSize: 13, color: "#555", marginTop: 8, fontWeight: 300, lineHeight: 1.6 }}>
            {enviado
              ? "Verifique sua caixa de entrada e siga as instruções."
              : "Informe seu e-mail e enviaremos um link para redefinir sua senha."}
          </p>
        </div>

        <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "36px 32px" }}>

          {enviado ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
              <span style={{ fontSize: 48 }}>📬</span>
              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7 }}>
                Se o e-mail <strong style={{ color: "#ccc" }}>{email}</strong> estiver cadastrado, você receberá as instruções em breve.
              </p>
              <p style={{ fontSize: 12, color: "#444" }}>
                Não recebeu? Verifique a pasta de spam ou{" "}
                <button onClick={() => setEnviado(false)}
                  style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
                  tente novamente
                </button>.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {error && (
                <div style={{ background: "#2a0a0a", border: "1px solid #cc3333", borderRadius: 2, padding: "10px 14px", fontSize: 12, color: "#ff6666" }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", marginBottom: 6 }}>
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={{ width: "100%", padding: "11px 14px", background: "#0d0d14", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#e0d5b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <button onClick={handleSubmit} disabled={loading}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}
                style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#444" }}>
          Lembrou a senha?{" "}
          <Link to="/login" style={{ color: "#d4af37", textDecoration: "none" }}>Fazer login</Link>
        </p>
      </div>
    </div>
  );
}