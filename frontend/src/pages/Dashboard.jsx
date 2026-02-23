import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProcess, listProcesses, downloadDocx } from "../services/processService";

function Dashboard() {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focused, setFocused] = useState(null);
  const [form, setForm] = useState({
    authorName: "",
    defendantName: "",
    cpfCnpj: "",
    vara: "",
    caseValue: "",
    narrative: "",
  });

  useEffect(() => {
    fetchProcesses();
  }, []);

  async function fetchProcesses() {
    try {
      const data = await listProcesses();
      setProcesses(data);
    } catch {
      console.error("Erro ao carregar processos.");
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await createProcess(form);
      setSuccess("Processo criado e documento gerado com sucesso!");
      setForm({ authorName: "", defendantName: "", cpfCnpj: "", vara: "", caseValue: "", narrative: "" });
      fetchProcesses();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao criar processo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(id) {
    setLoadingDocx(id);
    try {
      await downloadDocx(id);
    } catch {
      setError("Erro ao baixar documento.");
    } finally {
      setLoadingDocx(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const inputStyle = (field) => ({
    width: "100%",
    padding: "12px 16px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
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
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: focused === field ? "#d4af37" : "#999",
    marginBottom: "6px",
    fontFamily: "'DM Sans', sans-serif",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Navbar */}
      <div style={{ background: "#111118", borderBottom: "1px solid rgba(212,175,55,0.15)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#f0e6c8" }}>
          Pex<span style={{ color: "#d4af37" }}>AI</span>
        </span>
        <button
          onClick={handleLogout}
          onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#888"; }}
          style={{ background: "none", border: "none", color: "#888", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 0.2s" }}
        >
          Sair
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px" }}>

        {/* Título */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 8 }}>Nova peça jurídica</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "#f0e6c8", lineHeight: 1.2 }}>
            Cadastrar Processo
          </h1>
        </div>

        {/* Formulário */}
        <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "40px 48px", marginBottom: 48 }}>

          {error && (
            <div style={{ background: "#2a0a0a", border: "1px solid #cc3333", borderRadius: 2, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#ff6666" }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: "#0a2a0a", border: "1px solid #33cc33", borderRadius: 2, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#66ff66" }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Linha 1 — Autor e Réu */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div>
                <label style={labelStyle("authorName")}>Nome do Autor</label>
                <input
                  name="authorName" type="text" required placeholder="Nome completo do autor"
                  value={form.authorName} onChange={handleChange}
                  onFocus={() => setFocused("authorName")} onBlur={() => setFocused(null)}
                  style={inputStyle("authorName")}
                />
              </div>
              <div>
                <label style={labelStyle("defendantName")}>Nome do Réu</label>
                <input
                  name="defendantName" type="text" required placeholder="Nome completo do réu"
                  value={form.defendantName} onChange={handleChange}
                  onFocus={() => setFocused("defendantName")} onBlur={() => setFocused(null)}
                  style={inputStyle("defendantName")}
                />
              </div>
            </div>

            {/* Linha 2 — CPF/CNPJ, Vara, Valor */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div>
                <label style={labelStyle("cpfCnpj")}>CPF / CNPJ</label>
                <input
                  name="cpfCnpj" type="text" required placeholder="000.000.000-00"
                  value={form.cpfCnpj} onChange={handleChange}
                  onFocus={() => setFocused("cpfCnpj")} onBlur={() => setFocused(null)}
                  style={inputStyle("cpfCnpj")}
                />
              </div>
              <div>
                <label style={labelStyle("vara")}>Vara</label>
                <input
                  name="vara" type="text" required placeholder="Ex: 1ª Vara Cível"
                  value={form.vara} onChange={handleChange}
                  onFocus={() => setFocused("vara")} onBlur={() => setFocused(null)}
                  style={inputStyle("vara")}
                />
              </div>
              <div>
                <label style={labelStyle("caseValue")}>Valor da Causa (R$)</label>
                <input
                  name="caseValue" type="number" required placeholder="0,00" min="0" step="0.01"
                  value={form.caseValue} onChange={handleChange}
                  onFocus={() => setFocused("caseValue")} onBlur={() => setFocused(null)}
                  style={inputStyle("caseValue")}
                />
              </div>
            </div>

            {/* Narrativa */}
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle("narrative")}>Narrativa dos Fatos</label>
              <textarea
                name="narrative" required
                placeholder="Descreva os fatos do processo em detalhes..."
                value={form.narrative} onChange={handleChange}
                onFocus={() => setFocused("narrative")} onBlur={() => setFocused(null)}
                rows={6}
                style={{ ...inputStyle("narrative"), resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = "#1a1a2e"; e.currentTarget.style.color = "#f0e6c8"; }}
              style={{ padding: "14px 40px", background: "#1a1a2e", color: "#f0e6c8", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 2, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.25s, color 0.25s", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Gerando documento com IA..." : "Gerar documento jurídico"}
            </button>
          </form>
        </div>

        {/* Grid de Processos */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 8 }}>Histórico</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: "#f0e6c8" }}>
              Processos Cadastrados
            </h2>
          </div>

          {processes.length === 0 ? (
            <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: "48px", textAlign: "center", color: "#444" }}>
              <p style={{ fontSize: 14, fontWeight: 300 }}>Nenhum processo cadastrado ainda.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {processes.map((p) => (
                <div
                  key={p.id}
                  style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "28px 32px", transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)"}
                >
                  {/* Cabeçalho do card */}
                  <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 11, color: "#d4af37", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Autor</p>
                    <p style={{ fontSize: 16, color: "#f0e6c8", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>{p.authorName}</p>
                  </div>

                  {/* Dados */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                    {[
                      { label: "Réu", value: p.defendantName },
                      { label: "Vara", value: p.vara },
                      { label: "CPF/CNPJ", value: p.cpfCnpj },
                      { label: "Valor", value: `R$ ${Number(p.caseValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
                    ].map((item) => (
                      <div key={item.label}>
                        <p style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{item.label}</p>
                        <p style={{ fontSize: 13, color: "#ccc", fontWeight: 300 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Data e botão */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 11, color: "#444" }}>
                      {new Date(p.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <button
                      onClick={() => handleDownload(p.id)}
                      disabled={loadingDocx === p.id}
                      onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; e.currentTarget.style.borderColor = "#d4af37"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)"; }}
                      style={{ padding: "8px 16px", background: "transparent", color: "#d4af37", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: loadingDocx === p.id ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: loadingDocx === p.id ? 0.5 : 1 }}
                    >
                      {loadingDocx === p.id ? "Baixando..." : "⬇ DOCX"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;