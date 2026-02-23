import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "15px",
    fontWeight: 300,
    color: "#1a1a2e",
    background: "#fff",
    border: focused === field ? "1px solid #d4af37" : "1px solid #e0ddd5",
    borderRadius: "2px",
    outline: "none",
    boxShadow: focused === field ? "0 0 0 3px rgba(212,175,55,0.08)" : "none",
    transition: "border-color 0.25s, box-shadow 0.25s",
    boxSizing: "border-box",
    display: "block",
  });

  const labelStyle = (field) => ({
    display: "block",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: focused === field ? "#d4af37" : "#999",
    marginBottom: "8px",
    transition: "color 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#0a0a0f", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Painel Esquerdo */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 80, right: 40, width: 80, height: 80, border: "1px solid rgba(212,175,55,0.15)", transform: "rotate(45deg)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 120, right: 60, width: 40, height: 40, border: "1px solid rgba(212,175,55,0.1)", transform: "rotate(45deg)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #d4af37, #f5d55e)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "#0a0a0f" }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "#f0e6c8", letterSpacing: "0.03em" }}>
            Pex<span style={{ color: "#d4af37" }}>AI</span>
          </span>
        </div>

        <div style={{ zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 20 }}>Inteligência Jurídica</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(42px, 5vw, 68px)", fontWeight: 300, lineHeight: 1.1, color: "#f0e6c8", marginBottom: 24 }}>
            Comece sua jornada<br />
            <em style={{ fontStyle: "italic", color: "#d4af37" }}>hoje mesmo.</em>
          </h1>
          <p style={{ fontSize: 15, color: "#666680", lineHeight: 1.7, maxWidth: 380, fontWeight: 300 }}>
            Crie sua conta e tenha acesso imediato à geração inteligente de documentos jurídicos.
          </p>
        </div>

        <div style={{ fontSize: 12, color: "#3a3a50", zIndex: 1 }}>© 2026 PexAI · Todos os direitos reservados</div>
      </div>

      {/* Painel Direito */}
      <div style={{ width: "clamp(360px, 40%, 520px)", minHeight: "100vh", background: "#f7f5f0", display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px 56px", position: "relative", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.3), transparent)" }} />

        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: "#1a1a2e", marginBottom: 8 }}>Criar conta</h2>
          <p style={{ fontSize: 14, color: "#888", fontWeight: 300 }}>Preencha os dados para começar</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 1, background: "#d4af37", opacity: 0.3 }} />
          <div style={{ width: 6, height: 6, background: "#d4af37", transform: "rotate(45deg)", opacity: 0.6 }} />
          <div style={{ flex: 1, height: 1, background: "#d4af37", opacity: 0.3 }} />
        </div>

        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 2, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#cc3333", fontFamily: "'DM Sans', sans-serif" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ width: "100%" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle("name")}>Nome completo</label>
            <input
              type="text" required placeholder="Seu nome" value={name}
              onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
              onChange={(e) => setName(e.target.value)} style={inputStyle("name")}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle("email")}>Endereço de e-mail</label>
            <input
              type="email" required placeholder="seu@email.com" value={email}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              onChange={(e) => setEmail(e.target.value)} style={inputStyle("email")}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle("password")}>Senha</label>
            <input
              type="password" required placeholder="••••••••" value={password}
              onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
              onChange={(e) => setPassword(e.target.value)} style={inputStyle("password")}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle("confirmPassword")}>Confirmar senha</label>
            <input
              type="password" required placeholder="••••••••" value={confirmPassword}
              onFocus={() => setFocused("confirmPassword")} onBlur={() => setFocused(null)}
              onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle("confirmPassword")}
            />
          </div>

          <button
            type="submit" disabled={loading}
            onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1a1a2e"; e.currentTarget.style.color = "#f0e6c8"; }}
            style={{ width: "100%", padding: "15px", marginTop: 16, background: "#1a1a2e", color: "#f0e6c8", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", borderRadius: 2, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.25s, color 0.25s", boxSizing: "border-box", display: "block", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: "#aaa", fontWeight: 300 }}>
          Já tem uma conta?{" "}
          <a href="/login" style={{ color: "#d4af37", textDecoration: "none", fontWeight: 500 }}>Fazer login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;