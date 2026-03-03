import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [novaSenha, setNovaSenha]         = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading]             = useState(false);
  const [sucesso, setSucesso]             = useState(false);
  const [error, setError]                 = useState("");
  const [mostrarSenha, setMostrarSenha]   = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!novaSenha || !confirmarSenha) { setError("Preencha todos os campos."); return; }
    if (novaSenha.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (novaSenha !== confirmarSenha) { setError("As senhas não coincidem."); return; }
    if (!token) { setError("Token inválido. Solicite um novo link."); return; }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, novaSenha });
      setSucesso(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao redefinir senha.");
    } finally { setLoading(false); }
  };

  const iS = {
    width: "100%", padding: "11px 14px", background: "#0d0d14",
    border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2,
    color: "#e0d5b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box",
  };

  const lS = {
    display: "block", fontSize: 10, fontWeight: 500,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#666", fontFamily: "'DM Sans', sans-serif", marginBottom: 6,
  };

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#f0e6c8", margin: "16px 0 8px" }}>Link inválido</h2>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>Este link de redefinição é inválido ou já foi utilizado.</p>
          <Link to="/forgot-password" style={{ color: "#d4af37", fontSize: 13, textDecoration: "none" }}>
            Solicitar novo link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: "#d4af37", marginBottom: 8 }}>PexAI</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: "#f0e6c8" }}>
            {sucesso ? "Senha redefinida!" : "Nova senha"}
          </h1>
          <p style={{ fontSize: 13, color: "#555", marginTop: 8, fontWeight: 300 }}>
            {sucesso ? "Redirecionando para o login..." : "Escolha uma nova senha para sua conta."}
          </p>
        </div>

        <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "36px 32px" }}>

          {sucesso ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
              <span style={{ fontSize: 48 }}>✅</span>
              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7 }}>
                Sua senha foi redefinida com sucesso! Você será redirecionado para o login em instantes.
              </p>
              <Link to="/login"
                style={{ padding: "10px 28px", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", textDecoration: "none" }}>
                Ir para o login
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {error && (
                <div style={{ background: "#2a0a0a", border: "1px solid #cc3333", borderRadius: 2, padding: "10px 14px", fontSize: 12, color: "#ff6666" }}>
                  {error}
                </div>
              )}

              <div>
                <label style={lS}>Nova Senha</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    style={{ ...iS, paddingRight: 40 }}
                  />
                  <button onClick={() => setMostrarSenha(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: 0 }}>
                    {mostrarSenha ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div>
                <label style={lS}>Confirmar Nova Senha</label>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={iS}
                />
                {confirmarSenha && novaSenha !== confirmarSenha && (
                  <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>As senhas não coincidem.</span>
                )}
                {confirmarSenha && novaSenha === confirmarSenha && novaSenha.length >= 6 && (
                  <span style={{ fontSize: 11, color: "#22c55e", marginTop: 4, display: "block" }}>✓ Senhas coincidem.</span>
                )}
              </div>

              <button onClick={handleSubmit} disabled={loading}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}
                style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Salvando..." : "Redefinir senha"}
              </button>
            </div>
          )}
        </div>

        {!sucesso && (
          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#444" }}>
            <Link to="/login" style={{ color: "#d4af37", textDecoration: "none" }}>← Voltar ao login</Link>
          </p>
        )}
      </div>
    </div>
  );
}