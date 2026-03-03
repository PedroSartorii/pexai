import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const PLANO = {
  nome: "Pro", tag: "Plano único", preco: "R$ 197", periodo: "/mês",
  descricao: "pexAI completo com implantação personalizada no seu escritório.",
  features: ["Processos ilimitados", "Cadastro de clientes", "Kanban jurídico completo", "Geração de minutas com IA", "Dashboard financeiro", "Repassess e parcerias", "Suporte prioritário"],
};

const PILARES = [
  {
    icone: <svg width="28" height="28" fill="none" stroke="#d4af37" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
    titulo: "Petições em segundos",
    texto: "O pexAI usa o Gemini para gerar minutas processuais completas a partir dos dados do caso. O que levava horas agora leva segundos — com linguagem jurídica precisa.",
  },
  {
    icone: <svg width="28" height="28" fill="none" stroke="#d4af37" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    titulo: "Gestão financeira inteligente",
    texto: "Dashboard com KPIs em tempo real: faturamento, inadimplência, previsão de recebimentos e saldo de parcerias. Veja o LTV de cada cliente.",
  },
  {
    icone: <svg width="28" height="28" fill="none" stroke="#d4af37" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    titulo: "Zero prazo perdido",
    texto: "O Kanban jurídico organiza suas demandas por etapa e alerta visualmente sobre prazos fatais. Vermelho, amarelo, verde — você vê o risco antes de ser tarde.",
  },
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

const FadeIn = ({ children, delay = 0, style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
};

const ModalContato = ({ onClose }) => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  // Máscara simples de telefone: (11) 99999-9999
  const handleTelefone = (val) => {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    let masked = nums;
    if (nums.length > 2) masked = `(${nums.slice(0,2)}) ${nums.slice(2)}`;
    if (nums.length > 7) masked = `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`;
    setTelefone(masked);
  };

  const handleSubmit = async () => {
    if (!nome.trim() || !telefone.trim() || !email.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }
    setLoading(true); setErro("");
    try {
      await api.post("/contato/vendas", { nome, telefone, email });
      setEnviado(true);
    } catch {
      setErro("Erro ao enviar. Tente novamente.");
    } finally { setLoading(false); }
  };

  const iS = {
    width: "100%", padding: "11px 14px", background: "#0d0d14",
    border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2,
    color: "#e0d5b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box",
  };

  const lS = {
    display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.15em",
    textTransform: "uppercase", color: "#666", marginBottom: 6,
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", padding: 16 }}>
      <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 440 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>Plano Pro</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#f0e6c8", margin: 0 }}>Falar com especialista</h2>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer", padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px" }}>
          {enviado ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <span style={{ fontSize: 44 }}>📬</span>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "#f0e6c8", margin: "16px 0 8px" }}>
                Recebemos seu contato!
              </h3>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.75, margin: "0 0 24px" }}>
                Nossa equipe entrará em contato em breve.
              </p>
              <button onClick={onClose}
                onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}
                style={{ padding: "10px 28px", background: "transparent", border: "1px solid rgba(212,175,55,0.35)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.25s" }}>
                Fechar
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.75, margin: 0, fontWeight: 300 }}>
                Deixe seus dados e nossa equipe entrará em contato para apresentar o plano Pro.
              </p>

              {erro && (
                <div style={{ background: "#2a0a0a", border: "1px solid #cc3333", borderRadius: 2, padding: "10px 14px", fontSize: 12, color: "#ff6666" }}>{erro}</div>
              )}

              <div>
                <label style={lS}>Nome completo</label>
                <input placeholder="Dr. João Silva" value={nome} onChange={e => setNome(e.target.value)} style={iS} />
              </div>

              <div>
                <label style={lS}>Telefone / WhatsApp</label>
                <input
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={e => handleTelefone(e.target.value)}
                  style={iS}
                />
              </div>

              <div>
                <label style={lS}>E-mail</label>
                <input
                  type="email" placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={iS}
                />
              </div>

              <button onClick={handleSubmit} disabled={loading}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}
                style={{ padding: "13px", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Enviando..." : "Quero conhecer o plano Pro →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [focused, setFocused] = useState(null); const [hoveredPlano, setHoveredPlano] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const navigate = useNavigate();
  const planosRef = useRef(null);

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) { setError(err.response?.data?.error || "Erro ao fazer login. Tente novamente."); }
    finally { setLoading(false); }
  }

  const scrollToPlanos = () => planosRef.current?.scrollIntoView({ behavior: "smooth" });

  const iStyle = (field) => ({ width: "100%", padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 300, color: "#1a1a2e", background: "#fff", border: focused === field ? "1px solid #d4af37" : "1px solid #e0ddd5", borderRadius: "2px", outline: "none", boxShadow: focused === field ? "0 0 0 3px rgba(212,175,55,0.08)" : "none", transition: "border-color 0.25s, box-shadow 0.25s", boxSizing: "border-box", display: "block" });
  const lStyle = (field) => ({ display: "block", fontSize: "11px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: focused === field ? "#d4af37" : "#999", marginBottom: "8px", transition: "color 0.2s", fontFamily: "'DM Sans', sans-serif" });

  return (
    <div style={{ background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── HERO LOGIN ── */}
      <div style={{ minHeight: "100vh", display: "flex", overflow: "hidden" }}>

        {/* Esquerdo */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 80, right: 40, width: 80, height: 80, border: "1px solid rgba(212,175,55,0.15)", transform: "rotate(45deg)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 120, right: 60, width: 40, height: 40, border: "1px solid rgba(212,175,55,0.1)", transform: "rotate(45deg)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #d4af37, #f5d55e)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "#0a0a0f" }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "#f0e6c8", letterSpacing: "0.03em" }}>Pex<span style={{ color: "#d4af37" }}>AI</span></span>
          </div>

          <div style={{ zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 20 }}>Inteligência Jurídica</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(42px, 5vw, 68px)", fontWeight: 300, lineHeight: 1.1, color: "#f0e6c8", marginBottom: 24 }}>
              Documentos jurídicos,<br />gerados com <em style={{ fontStyle: "italic", color: "#d4af37" }}>precisão.</em>
            </h1>
            <p style={{ fontSize: 15, color: "#666680", lineHeight: 1.7, maxWidth: 380, fontWeight: 300, marginBottom: 36 }}>
              Automatize petições, contratos e pareceres com IA treinada no direito brasileiro.
            </p>
            <button onClick={scrollToPlanos} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 1, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.6"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              <span style={{ fontSize: 12, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Conheça o pexAI</span>
              <svg width="16" height="16" fill="none" stroke="#d4af37" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
          </div>

          <div style={{ fontSize: 12, color: "#3a3a50", zIndex: 1 }}>© 2026 PexAI · Todos os direitos reservados</div>
        </div>

        {/* Direito — Formulário */}
        <div style={{ width: "clamp(360px, 40%, 520px)", minHeight: "100vh", background: "#f7f5f0", display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px 56px", position: "relative", boxSizing: "border-box" }}>
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.3), transparent)" }} />
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: "#1a1a2e", marginBottom: 8 }}>Bem-vindo de volta</h2>
            <p style={{ fontSize: 14, color: "#888", fontWeight: 300 }}>Entre na sua conta para continuar</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ flex: 1, height: 1, background: "#d4af37", opacity: 0.3 }} />
            <div style={{ width: 6, height: 6, background: "#d4af37", transform: "rotate(45deg)", opacity: 0.6 }} />
            <div style={{ flex: 1, height: 1, background: "#d4af37", opacity: 0.3 }} />
          </div>
          {error && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 2, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#cc3333" }}>{error}</div>}
          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <div style={{ marginBottom: 24 }}>
              <label style={lStyle("email")}>Endereço de e-mail</label>
              <input type="email" required placeholder="seu@email.com" value={email} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} onChange={(e) => setEmail(e.target.value)} style={iStyle("email")} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={lStyle("password")}>Senha</label>
              <input type="password" required placeholder="••••••••" value={password} onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} onChange={(e) => setPassword(e.target.value)} style={iStyle("password")} />
              <Link to="/forgot-password" style={{ display: "block", textAlign: "right", fontSize: 12, color: "#aaa", textDecoration: "none", marginTop: 6 }} onMouseEnter={e => e.currentTarget.style.color = "#d4af37"} onMouseLeave={e => e.currentTarget.style.color = "#aaa"}>Esqueceu a senha?</Link>
            </div>
            <button type="submit" disabled={loading} onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }} onMouseLeave={e => { e.currentTarget.style.background = "#1a1a2e"; e.currentTarget.style.color = "#f0e6c8"; }} style={{ width: "100%", padding: "15px", marginTop: 16, background: "#1a1a2e", color: "#f0e6c8", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", borderRadius: 2, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.25s, color 0.25s", boxSizing: "border-box", display: "block", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Entrando..." : "Acessar plataforma"}
            </button>
          </form>
          <p style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: "#aaa", fontWeight: 300 }}>
            Ainda não tem conta?{" "}
            <Link to="/register" style={{ color: "#d4af37", textDecoration: "none", fontWeight: 500 }}>Criar conta</Link>
          </p>
          <div style={{ display: "flex", gap: 20, marginTop: 40, paddingTop: 28, borderTop: "1px solid #e8e4dc", flexWrap: "wrap" }}>
            {[{ icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "Criptografado" }, { icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", label: "LGPD" }, { icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", label: "99.9% uptime" }].map((b) => (
              <span key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#bbb" }}>
                <svg viewBox="0 0 24 24" strokeWidth="1.5" style={{ width: 14, height: 14, stroke: "#d4af37", fill: "none", flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d={b.icon} /></svg>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEÇÃO pexAI ── */}
      <section style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn><div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}><div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 20px", background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.22)", borderRadius: 100 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d4af37", boxShadow: "0 0 10px #d4af37" }} /><span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#d4af37" }}>Inteligência Artificial Jurídica</span></div></div></FadeIn>
        <FadeIn delay={0.1}><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 300, color: "#f0e6c8", textAlign: "center", lineHeight: 1.08, margin: "0 0 28px" }}>A advocacia do futuro<br /><em style={{ fontStyle: "italic", color: "#d4af37" }}>já chegou ao seu escritório.</em></h2></FadeIn>
        <FadeIn delay={0.18}><p style={{ fontSize: 16, color: "#5a5a6a", textAlign: "center", maxWidth: 560, margin: "0 auto 72px", lineHeight: 1.85, fontWeight: 300 }}>O <strong style={{ color: "#d4af37", fontWeight: 500 }}>pexAI</strong> é o motor de inteligência por trás do sistema — ele automatiza o trabalho repetitivo, organiza seus casos e transforma dados em decisões. Como um sócio sênior que nunca dorme.</p></FadeIn>
        <FadeIn delay={0.22}><div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 360, margin: "0 auto 72px" }}><div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(212,175,55,0.35))" }} /><div style={{ width: 6, height: 6, background: "#d4af37", transform: "rotate(45deg)", opacity: 0.7 }} /><div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(212,175,55,0.35))" }} /></div></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
          {PILARES.map((pilar, i) => (
            <FadeIn key={i} delay={0.08 * i + 0.28}>
              <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 4, padding: "36px 30px", display: "flex", flexDirection: "column", gap: 16, height: "100%", boxSizing: "border-box", transition: "border-color 0.3s, transform 0.3s", cursor: "default" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; e.currentTarget.style.transform = "translateY(-5px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ width: 52, height: 52, background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{pilar.icone}</div>
                <div style={{ width: 28, height: 1, background: "rgba(212,175,55,0.25)" }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: "#f0e6c8", lineHeight: 1.3, margin: 0 }}>{pilar.titulo}</h3>
                <p style={{ fontSize: 13, color: "#5a5a6a", lineHeight: 1.85, fontWeight: 300, margin: 0 }}>{pilar.texto}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.48}><div style={{ padding: "28px 36px", background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.1)", borderLeft: "3px solid rgba(212,175,55,0.5)", borderRadius: "0 4px 4px 0", maxWidth: 640, margin: "72px auto 0" }}><p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 300, color: "#c8bfa0", lineHeight: 1.75, fontStyle: "italic", margin: 0 }}>"O pexAI não substitui o advogado. Ele elimina tudo que impede o advogado de ser extraordinário."</p></div></FadeIn>
      </section>

      <div style={{ width: "100%", height: 1, background: "linear-gradient(to right, transparent, rgba(212,175,55,0.15), transparent)" }} />

      {/* ── SEÇÃO PLANO ── */}
      <section ref={planosRef} style={{ padding: "120px 24px", maxWidth: 680, margin: "0 auto" }}>
        <FadeIn delay={0.05}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#d4af37", marginBottom: 18 }}>Plano & Investimento</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 300, color: "#f0e6c8", marginBottom: 16, lineHeight: 1.1 }}>Tudo que você precisa,<br /><em style={{ fontStyle: "italic", color: "#d4af37" }}>em um único plano.</em></h2>
            <p style={{ fontSize: 14, color: "#4a4a5a", fontWeight: 300, maxWidth: 380, margin: "0 auto", lineHeight: 1.8 }}>Sem camadas, sem surpresas. O pexAI completo do primeiro dia.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div onMouseEnter={() => setHoveredPlano(true)} onMouseLeave={() => setHoveredPlano(false)} style={{ background: "rgba(212,175,55,0.06)", border: `1px solid ${hoveredPlano ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.2)"}`, borderRadius: 4, padding: "52px 48px", display: "flex", flexDirection: "column", position: "relative", transition: "border-color 0.3s, box-shadow 0.3s", boxShadow: hoveredPlano ? "0 0 100px rgba(212,175,55,0.1)" : "0 0 60px rgba(212,175,55,0.05)" }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#d4af37", color: "#0a0a0f", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", padding: "5px 24px", borderRadius: 2, whiteSpace: "nowrap" }}>PLANO ÚNICO</div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", margin: "0 0 8px" }}>{PLANO.tag}</p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "#f0e6c8", margin: "0 0 6px", lineHeight: 1 }}>{PLANO.nome}</h3>
                <p style={{ fontSize: 13, color: "#5a5a6a", fontWeight: 300, margin: 0, lineHeight: 1.7 }}>{PLANO.descricao}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 300, color: "#d4af37", lineHeight: 1 }}>{PLANO.preco}</span>
                  <span style={{ fontSize: 14, color: "#555" }}>{PLANO.periodo}</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "5px 12px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2 }}>
                  <svg width="12" height="12" fill="none" stroke="#d4af37" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span style={{ fontSize: 11, color: "#d4af37", letterSpacing: "0.05em" }}>Inclui implantação dedicada</span>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 40 }}>
              {PLANO.features.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#d4af37" strokeWidth="2.5" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  <span style={{ fontSize: 13, color: "#999", fontWeight: 300 }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setModalAberto(true)} onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; e.currentTarget.style.borderColor = "#d4af37"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,175,55,0.12)"; e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"; }} style={{ width: "100%", padding: "16px", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer", transition: "all 0.25s", marginBottom: 10 }}>Falar com especialista</button>
            <p style={{ fontSize: 11, color: "#383848", textAlign: "center", margin: 0 }}>implantação + mensalidade</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div style={{ marginTop: 32, padding: "20px 24px", background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 4, display: "flex", gap: 14, alignItems: "flex-start" }}>
            <svg width="17" height="17" fill="none" stroke="#d4af37" strokeWidth="1.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.8, fontWeight: 300, margin: 0 }}>A <strong style={{ color: "#d4af37", fontWeight: 400 }}>implantação dedicada</strong> inclui configuração completa do sistema, migração de dados e treinamento personalizado. O valor é apresentado durante a conversa com nosso time.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div style={{ marginTop: 44, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[{ icon: "🔒", texto: "Pagamento seguro" }, { icon: "📅", texto: "7 dias de trial grátis" }, { icon: "✕", texto: "Cancele quando quiser" }, { icon: "💬", texto: "Suporte em português" }].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: "#3a3a4a" }}>{item.texto}</span>
              </div>
            ))}
          </div>
        </FadeIn>

      </section>

      {modalAberto && <ModalContato onClose={() => setModalAberto(false)} />}
    </div>
  );
}

export default Login;