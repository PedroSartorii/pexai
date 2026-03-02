import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const AREA_OPTIONS = [
  { value: "CIVIL",          label: "Direito Civil" },
  { value: "TRABALHISTA",    label: "Direito Trabalhista" },
  { value: "PENAL",          label: "Direito Penal" },
  { value: "TRIBUTARIO",     label: "Direito Tributário" },
  { value: "ADMINISTRATIVO", label: "Direito Administrativo" },
  { value: "PREVIDENCIARIO", label: "Direito Previdenciário" },
  { value: "CONSUMIDOR",     label: "Direito do Consumidor" },
  { value: "FAMILIA",        label: "Direito de Família" },
  { value: "EMPRESARIAL",    label: "Direito Empresarial" },
  { value: "AMBIENTAL",      label: "Direito Ambiental" },
  { value: "OUTROS",         label: "Outros" },
];

const PRIORIDADE_OPTIONS = [
  { value: "BAIXA",   label: "Baixa",   color: "#6dc87a" },
  { value: "MEDIA",   label: "Média",   color: "#d4af37" },
  { value: "ALTA",    label: "Alta",    color: "#fb923c" },
  { value: "URGENTE", label: "Urgente", color: "#f87171" },
];

const EMPTY_FORM = { titulo: "", areaDireito: "CIVIL", prioridade: "MEDIA" };

// ─── Modal ────────────────────────────────────────────────────────────────────
const ProcessTitleModal = ({ title, onClose, onSaved }) => {
  const [form, setForm] = useState(title ? { ...EMPTY_FORM, ...title } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    const e = {};
    if (!form.titulo.trim()) e.titulo = "Obrigatório";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      title
        ? await api.put(`/process-titles/${title.id}`, form, { headers })
        : await api.post("/process-titles", form, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar título.");
    } finally { setLoading(false); }
  };

  const inputStyle = (error) => ({
    width: "100%", padding: "10px 14px",
    background: "#0d0d14",
    border: `1px solid ${error ? "#cc3333" : "rgba(212,175,55,0.2)"}`,
    borderRadius: 2, color: "#e0d5b8", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
  });

  const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 500,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#666", fontFamily: "'DM Sans', sans-serif", marginBottom: 6,
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: 16 }}>
      <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 540, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {title ? "Editar" : "Novo"}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "#f0e6c8" }}>
              {title ? "Editar Título" : "Novo Título de Processo"}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Título */}
          <div>
            <label style={labelStyle}>Título / Nome Sugerido *</label>
            <input
              placeholder='Ex: "Indenizatória contra Empresa X"'
              value={form.titulo} onChange={set("titulo")}
              style={inputStyle(errors.titulo)}
            />
            {errors.titulo && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.titulo}</span>}
          </div>

          {/* Área do Direito */}
          <div>
            <label style={labelStyle}>Área do Direito *</label>
            <select value={form.areaDireito} onChange={set("areaDireito")}
              style={{ ...inputStyle(false), cursor: "pointer" }}>
              {AREA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <label style={labelStyle}>Prioridade *</label>
            <div style={{ display: "flex", gap: 10 }}>
              {PRIORIDADE_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setForm((f) => ({ ...f, prioridade: opt.value }))}
                  style={{
                    flex: 1, padding: "10px 8px",
                    background: form.prioridade === opt.value ? `${opt.color}18` : "transparent",
                    border: `1px solid ${form.prioridade === opt.value ? opt.color + "66" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                    color: form.prioridade === opt.value ? opt.color : "#555",
                    fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    cursor: "pointer", transition: "all 0.2s",
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
            {loading ? "Salvando..." : title ? "Salvar Alterações" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const ProcessTitleCard = ({ title, onEdit, onDelete }) => {
  const area = AREA_OPTIONS.find((a) => a.value === title.areaDireito);
  const prioridade = PRIORIDADE_OPTIONS.find((p) => p.value === title.prioridade);

  return (
    <div
      style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, color: "#f0e6c8", lineHeight: 1.3, flex: 1 }}>
          {title.titulo}
        </p>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onEdit(title)}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}>
            Editar
          </button>
          <button onClick={() => onDelete(title.id)}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.2)"; }}>
            Excluir
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, padding: "3px 10px", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 2, color: "#d4af37", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
          {area?.label}
        </span>
        <span style={{ fontSize: 10, padding: "3px 10px", border: `1px solid ${prioridade?.color}44`, borderRadius: 2, color: prioridade?.color, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
          {prioridade?.label}
        </span>
      </div>

      <p style={{ fontSize: 11, color: "#333", fontFamily: "'DM Sans', sans-serif" }}>
        Criado em {new Date(title.createdAt).toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function ProcessTitleRegister() {
  const navigate = useNavigate();
  const [titles, setTitles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchTitles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/process-titles", { headers: { Authorization: `Bearer ${token}` } });
      setTitles(res.data);
    } catch {
      alert("Erro ao carregar títulos.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTitles(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este título?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/process-titles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTitles((prev) => prev.filter((t) => t.id !== id));
    } catch { alert("Erro ao excluir título."); }
  };

  const filtered = titles.filter((t) =>
    t.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

      <div style={{ marginLeft: 220, flex: 1 }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Gestão</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f0e6c8" }}>Títulos de Processos</h1>
          </div>
          <button onClick={() => setModal("new")}
            style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}>
            + Novo Título
          </button>
        </header>

        <main style={{ padding: "40px 48px" }}>
          {/* Filtro */}
          <div style={{ marginBottom: 32, maxWidth: 360 }}>
            <input
              style={{ width: "100%", padding: "10px 16px", background: "#111118", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 2, color: "#ccc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
              placeholder="Filtrar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <p style={{ color: "#444", fontSize: 13 }}>Carregando títulos...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: 48, textAlign: "center" }}>
              <p style={{ color: "#444", fontSize: 14, fontWeight: 300 }}>
                {search ? "Nenhum título encontrado." : "Nenhum título cadastrado ainda."}
              </p>
              {!search && (
                <button onClick={() => setModal("new")} style={{ marginTop: 16, background: "none", border: "none", color: "#d4af37", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cadastrar primeiro título →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map((t) => (
                <ProcessTitleCard key={t.id} title={t} onEdit={setModal} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <ProcessTitleModal
          title={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchTitles}
        />
      )}
    </div>
  );
}