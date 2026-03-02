import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const POLO_OPTIONS = [
  { value: "ATIVO",   label: "Ativo",   color: "#6dc87a" },
  { value: "PASSIVO", label: "Passivo", color: "#f87171" },
  { value: "OUTROS",  label: "Outros",  color: "#c084fc" },
];

const EMPTY_FORM = { nome: "", descricao: "", polo: "ATIVO" };

// ─── Modal ────────────────────────────────────────────────────────────────────
const QualificationModal = ({ qualification, onClose, onSaved }) => {
  const [form, setForm] = useState(qualification ? { ...EMPTY_FORM, ...qualification } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.polo) e.polo = "Obrigatório";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      qualification
        ? await api.put(`/qualifications/${qualification.id}`, form, { headers })
        : await api.post("/qualifications", form, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar qualificação.");
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
      <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 520, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {qualification ? "Editar" : "Nova"}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "#f0e6c8" }}>
              {qualification ? "Editar Qualificação" : "Nova Qualificação"}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Nome */}
          <div>
            <label style={labelStyle}>Nome da Qualificação *</label>
            <input
              placeholder="Ex: Autor, Réu, Exequente..."
              value={form.nome} onChange={set("nome")}
              style={inputStyle(errors.nome)}
            />
            {errors.nome && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.nome}</span>}
          </div>

          {/* Polo */}
          <div>
            <label style={labelStyle}>Polo *</label>
            <div style={{ display: "flex", gap: 10 }}>
              {POLO_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setForm((f) => ({ ...f, polo: opt.value }))}
                  style={{
                    flex: 1, padding: "10px 8px",
                    background: form.polo === opt.value ? `${opt.color}18` : "transparent",
                    border: `1px solid ${form.polo === opt.value ? opt.color + "66" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                    color: form.polo === opt.value ? opt.color : "#555",
                    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.polo && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.polo}</span>}
          </div>

          {/* Descrição */}
          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea
              placeholder="Breve descrição do papel desta qualificação no processo..."
              value={form.descricao} onChange={set("descricao")}
              rows={3}
              style={{ ...inputStyle(false), resize: "vertical", lineHeight: 1.6 }}
            />
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
            {loading ? "Salvando..." : qualification ? "Salvar Alterações" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const QualificationCard = ({ qualification, onEdit, onDelete }) => {
  const polo = POLO_OPTIONS.find((p) => p.value === qualification.polo);
  return (
    <div
      style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: "#f0e6c8", marginBottom: 8 }}>
            {qualification.nome}
          </p>
          <span style={{ fontSize: 10, padding: "3px 10px", border: `1px solid ${polo.color}44`, borderRadius: 2, color: polo.color, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
            Polo {polo.label}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onEdit(qualification)}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}>
            Editar
          </button>
          <button onClick={() => onDelete(qualification.id)}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.2)"; }}>
            Excluir
          </button>
        </div>
      </div>

      {qualification.descricao && (
        <p style={{ fontSize: 13, color: "#555", fontWeight: 300, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12 }}>
          {qualification.descricao}
        </p>
      )}

      <p style={{ fontSize: 11, color: "#333", fontFamily: "'DM Sans', sans-serif" }}>
        Criado em {new Date(qualification.createdAt).toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function QualificationRegister() {
  const navigate = useNavigate();
  const [qualifications, setQualifications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchQualifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/qualifications", { headers: { Authorization: `Bearer ${token}` } });
      setQualifications(res.data);
    } catch {
      alert("Erro ao carregar qualificações.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQualifications(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir esta qualificação?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/qualifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setQualifications((prev) => prev.filter((q) => q.id !== id));
    } catch { alert("Erro ao excluir qualificação."); }
  };

  const filtered = qualifications.filter((q) =>
    q.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

      <div style={{ marginLeft: 220, flex: 1 }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Gestão</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f0e6c8" }}>Qualificações</h1>
          </div>
          <button onClick={() => setModal("new")}
            style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}>
            + Nova Qualificação
          </button>
        </header>

        <main style={{ padding: "40px 48px" }}>
          {/* Filtro */}
          <div style={{ marginBottom: 32, maxWidth: 360 }}>
            <input
              style={{ width: "100%", padding: "10px 16px", background: "#111118", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 2, color: "#ccc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
              placeholder="Filtrar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <p style={{ color: "#444", fontSize: 13 }}>Carregando qualificações...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: 48, textAlign: "center" }}>
              <p style={{ color: "#444", fontSize: 14, fontWeight: 300 }}>
                {search ? "Nenhuma qualificação encontrada." : "Nenhuma qualificação cadastrada ainda."}
              </p>
              {!search && (
                <button onClick={() => setModal("new")} style={{ marginTop: 16, background: "none", border: "none", color: "#d4af37", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cadastrar primeira qualificação →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map((q) => (
                <QualificationCard key={q.id} qualification={q} onEdit={setModal} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <QualificationModal
          qualification={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchQualifications}
        />
      )}
    </div>
  );
}