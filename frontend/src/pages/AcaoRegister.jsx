import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const RITO_OPTIONS = [
  { value: "COMUM",       label: "Comum" },
  { value: "SUMARISSIMO", label: "Sumaríssimo" },
  { value: "ESPECIAL",    label: "Especial" },
];

const EMPTY_FORM = { nomeAcao: "", fundamentacao: "", valorCausa: "", rito: "COMUM" };

// ─── Modal ────────────────────────────────────────────────────────────────────
const AcaoModal = ({ acao, onClose, onSaved }) => {
  const [form, setForm] = useState(acao ? { ...EMPTY_FORM, ...acao, valorCausa: acao.valorCausa ?? "" } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    const e = {};
    if (!form.nomeAcao.trim()) e.nomeAcao = "Obrigatório";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        nomeAcao: form.nomeAcao,
        fundamentacao: form.fundamentacao || null,
        valorCausa: form.valorCausa !== "" ? parseFloat(form.valorCausa) : null,
        rito: form.rito,
      };
      acao
        ? await api.put(`/acoes/${acao.id}`, payload, { headers })
        : await api.post("/acoes", payload, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar ação.");
    } finally { setLoading(false); }
  };

  const inputStyle = (error) => ({
    width: "100%", padding: "10px 14px", background: "#0d0d14",
    border: `1px solid ${error ? "#cc3333" : "rgba(212,175,55,0.2)"}`,
    borderRadius: 2, color: "#e0d5b8", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
  });

  const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 500,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#666", fontFamily: "'DM Sans', sans-serif", marginBottom: 6,
  };

  const SectionTitle = ({ children }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: 16 }}>
      <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 580, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {acao ? "Editar" : "Nova"}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "#f0e6c8" }}>
              {acao ? "Editar Ação" : "Nova Ação"}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Dados da Ação */}
          <div>
            <SectionTitle>Dados da Ação</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Nome da Ação *</label>
                <input
                  placeholder="Ex: Ação de Cobrança, Habeas Corpus..."
                  value={form.nomeAcao} onChange={set("nomeAcao")}
                  style={inputStyle(errors.nomeAcao)}
                />
                {errors.nomeAcao && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.nomeAcao}</span>}
              </div>

              <div>
                <label style={labelStyle}>Valor da Causa (R$)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 13, fontFamily: "'DM Sans', sans-serif", pointerEvents: "none" }}>
                    R$
                  </span>
                  <input
                    type="number" min="0" step="0.01"
                    placeholder="0,00"
                    value={form.valorCausa} onChange={set("valorCausa")}
                    style={{ ...inputStyle(false), paddingLeft: 36 }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Fundamentação Legal</label>
                <textarea
                  placeholder="Ex: Art. 319 do CPC, Art. 7º da CLT..."
                  value={form.fundamentacao} onChange={set("fundamentacao")}
                  rows={3}
                  style={{ ...inputStyle(false), resize: "vertical", lineHeight: 1.6 }}
                />
              </div>
            </div>
          </div>

          {/* Rito Processual */}
          <div>
            <SectionTitle>Rito Processual</SectionTitle>
            <div style={{ display: "flex", gap: 10 }}>
              {RITO_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setForm((f) => ({ ...f, rito: opt.value }))}
                  style={{
                    flex: 1, padding: "10px 8px",
                    background: form.rito === opt.value ? "rgba(212,175,55,0.1)" : "transparent",
                    border: `1px solid ${form.rito === opt.value ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                    color: form.rito === opt.value ? "#d4af37" : "#555",
                    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.05em", cursor: "pointer", transition: "all 0.2s",
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "20px 32px", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
          <button onClick={onClose}
            style={{ padding: "10px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, color: "#666", fontSize: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}
            style={{ padding: "10px 28px", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Salvando..." : acao ? "Salvar Alterações" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const AcaoCard = ({ acao, onEdit, onDelete }) => {
  const rito = RITO_OPTIONS.find((r) => r.value === acao.rito);

  return (
    <div
      style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, color: "#f0e6c8", lineHeight: 1.3, flex: 1 }}>
          {acao.nomeAcao}
        </p>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onEdit(acao)}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}>
            Editar
          </button>
          <button onClick={() => onDelete(acao.id)}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.2)"; }}>
            Excluir
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Rito</p>
          <p style={{ fontSize: 13, color: "#aaa", fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}>{rito?.label}</p>
        </div>
        {acao.valorCausa && (
          <div>
            <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Valor da Causa</p>
            <p style={{ fontSize: 13, color: "#d4af37", fontWeight: 400, fontFamily: "'DM Sans', sans-serif" }}>
              {Number(acao.valorCausa).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        )}
        {acao.fundamentacao && (
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Fundamentação</p>
            <p style={{ fontSize: 12, color: "#666", fontWeight: 300, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{acao.fundamentacao}</p>
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, color: "#333", fontFamily: "'DM Sans', sans-serif" }}>
        Criado em {new Date(acao.createdAt).toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function AcaoRegister() {
  const navigate = useNavigate();
  const [acoes, setAcoes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchAcoes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/acoes", { headers: { Authorization: `Bearer ${token}` } });
      setAcoes(res.data);
    } catch {
      alert("Erro ao carregar ações.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAcoes(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir esta ação?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/acoes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAcoes((prev) => prev.filter((a) => a.id !== id));
    } catch { alert("Erro ao excluir ação."); }
  };

  const filtered = acoes.filter((a) =>
    a.nomeAcao.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

      <div style={{ marginLeft: 220, flex: 1 }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Gestão</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f0e6c8" }}>Ações</h1>
          </div>
          <button onClick={() => setModal("new")}
            style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}>
            + Nova Ação
          </button>
        </header>

        <main style={{ padding: "40px 48px" }}>
          {/* Filtro */}
          <div style={{ marginBottom: 32, maxWidth: 360 }}>
            <input
              style={{ width: "100%", padding: "10px 16px", background: "#111118", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 2, color: "#ccc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
              placeholder="Filtrar por nome da ação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <p style={{ color: "#444", fontSize: 13 }}>Carregando ações...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: 48, textAlign: "center" }}>
              <p style={{ color: "#444", fontSize: 14, fontWeight: 300 }}>
                {search ? "Nenhuma ação encontrada." : "Nenhuma ação cadastrada ainda."}
              </p>
              {!search && (
                <button onClick={() => setModal("new")} style={{ marginTop: 16, background: "none", border: "none", color: "#d4af37", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cadastrar primeira ação →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map((a) => (
                <AcaoCard key={a.id} acao={a} onEdit={setModal} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <AcaoModal
          acao={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchAcoes}
        />
      )}
    </div>
  );
}