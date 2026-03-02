import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const INSTANCIA_OPTIONS = [
  { value: "PRIMEIRA", label: "1ª Instância" },
  { value: "SEGUNDA",  label: "2ª Instância" },
  { value: "SUPERIOR", label: "Tribunais Superiores" },
];

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const EMPTY_FORM = {
  tribunal: "", comarca: "", instancia: "PRIMEIRA",
  orgaoJulgador: "", cep: "", logradouro: "",
  numero: "", complemento: "", bairro: "", cidade: "", uf: "",
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const JuizoModal = ({ juizo, onClose, onSaved }) => {
  const [form, setForm] = useState(juizo ? { ...EMPTY_FORM, ...juizo } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCep = async () => {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) setForm((f) => ({
        ...f, logradouro: data.logradouro || "",
        bairro: data.bairro || "", cidade: data.localidade || "", uf: data.uf || "",
      }));
    } finally { setCepLoading(false); }
  };

  const handleSubmit = async () => {
    const e = {};
    if (!form.tribunal.trim())      e.tribunal      = "Obrigatório";
    if (!form.comarca.trim())       e.comarca       = "Obrigatório";
    if (!form.orgaoJulgador.trim()) e.orgaoJulgador = "Obrigatório";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      juizo
        ? await api.put(`/juizos/${juizo.id}`, payload, { headers })
        : await api.post("/juizos", payload, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar juízo.");
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
      <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {juizo ? "Editar" : "Novo"}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "#f0e6c8" }}>
              {juizo ? "Editar Juízo" : "Novo Juízo"}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Dados do Juízo */}
          <div>
            <SectionTitle>Dados do Juízo</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Tribunal *</label>
                <input placeholder="Ex: TJSP, TRF3, TST" value={form.tribunal} onChange={set("tribunal")} style={inputStyle(errors.tribunal)} />
                {errors.tribunal && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.tribunal}</span>}
              </div>
              <div>
                <label style={labelStyle}>Comarca / Foro *</label>
                <input placeholder="Ex: Capital, Campinas" value={form.comarca} onChange={set("comarca")} style={inputStyle(errors.comarca)} />
                {errors.comarca && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.comarca}</span>}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Órgão Julgador *</label>
                <input placeholder="Ex: 2ª Vara Cível, 5ª Turma Recursal" value={form.orgaoJulgador} onChange={set("orgaoJulgador")} style={inputStyle(errors.orgaoJulgador)} />
                {errors.orgaoJulgador && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.orgaoJulgador}</span>}
              </div>
            </div>
          </div>

          {/* Instância */}
          <div>
            <SectionTitle>Instância</SectionTitle>
            <div style={{ display: "flex", gap: 10 }}>
              {INSTANCIA_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setForm((f) => ({ ...f, instancia: opt.value }))}
                  style={{
                    flex: 1, padding: "10px 8px",
                    background: form.instancia === opt.value ? "rgba(212,175,55,0.1)" : "transparent",
                    border: `1px solid ${form.instancia === opt.value ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                    color: form.instancia === opt.value ? "#d4af37" : "#555",
                    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.05em", cursor: "pointer", transition: "all 0.2s",
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Endereço */}
          <div>
            <SectionTitle>Endereço do Juízo</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
              <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>CEP</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input style={{ flex: 1, padding: "10px 14px", background: "#0d0d14", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#e0d5b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                    placeholder="00000-000" value={form.cep} onChange={set("cep")} onBlur={handleCep} />
                  {cepLoading && <span style={{ color: "#d4af37", fontSize: 12 }}>...</span>}
                </div>
              </div>
              <div style={{ gridColumn: "span 3" }}>
                <label style={labelStyle}>Logradouro</label>
                <input placeholder="Rua, Av..." value={form.logradouro} onChange={set("logradouro")} style={inputStyle(false)} />
              </div>
              <div style={{ gridColumn: "span 1" }}>
                <label style={labelStyle}>Número</label>
                <input placeholder="123" value={form.numero} onChange={set("numero")} style={inputStyle(false)} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Complemento</label>
                <input placeholder="Sala 5" value={form.complemento} onChange={set("complemento")} style={inputStyle(false)} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Bairro</label>
                <input placeholder="Centro" value={form.bairro} onChange={set("bairro")} style={inputStyle(false)} />
              </div>
              <div style={{ gridColumn: "span 1" }}>
                <label style={labelStyle}>Cidade</label>
                <input placeholder="São Paulo" value={form.cidade} onChange={set("cidade")} style={inputStyle(false)} />
              </div>
              <div style={{ gridColumn: "span 1" }}>
                <label style={labelStyle}>UF</label>
                <select value={form.uf} onChange={set("uf")}
                  style={{ ...inputStyle(false), cursor: "pointer" }}>
                  <option value="">UF</option>
                  {UF_OPTIONS.map((uf) => <option key={uf}>{uf}</option>)}
                </select>
              </div>
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
            {loading ? "Salvando..." : juizo ? "Salvar Alterações" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const JuizoCard = ({ juizo, onEdit, onDelete }) => {
  const instancia = INSTANCIA_OPTIONS.find((i) => i.value === juizo.instancia);

  return (
    <div
      style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <p style={{ fontSize: 11, color: "#d4af37", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
            {juizo.tribunal}
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, color: "#f0e6c8" }}>
            {juizo.orgaoJulgador}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onEdit(juizo)}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}>
            Editar
          </button>
          <button onClick={() => onDelete(juizo.id)}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.2)"; }}>
            Excluir
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Comarca", value: juizo.comarca },
          { label: "Instância", value: instancia?.label },
          { label: "Cidade", value: juizo.cidade && juizo.uf ? `${juizo.cidade} - ${juizo.uf}` : juizo.cidade },
          { label: "Endereço", value: juizo.logradouro && juizo.numero ? `${juizo.logradouro}, ${juizo.numero}` : juizo.logradouro },
        ].filter((i) => i.value).map((item) => (
          <div key={item.label}>
            <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</p>
            <p style={{ fontSize: 13, color: "#aaa", fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}>{item.value}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "#333", fontFamily: "'DM Sans', sans-serif" }}>
        Criado em {new Date(juizo.createdAt).toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function JuizoRegister() {
  const navigate = useNavigate();
  const [juizos, setJuizos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchJuizos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/juizos", { headers: { Authorization: `Bearer ${token}` } });
      setJuizos(res.data);
    } catch {
      alert("Erro ao carregar juízos.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJuizos(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este juízo?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/juizos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setJuizos((prev) => prev.filter((j) => j.id !== id));
    } catch { alert("Erro ao excluir juízo."); }
  };

  const filtered = juizos.filter((j) =>
    j.tribunal.toLowerCase().includes(search.toLowerCase()) ||
    j.orgaoJulgador.toLowerCase().includes(search.toLowerCase()) ||
    j.comarca.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

      <div style={{ marginLeft: 220, flex: 1 }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Gestão</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f0e6c8" }}>Juízos</h1>
          </div>
          <button onClick={() => setModal("new")}
            style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}>
            + Novo Juízo
          </button>
        </header>

        <main style={{ padding: "40px 48px" }}>
          {/* Filtro */}
          <div style={{ marginBottom: 32, maxWidth: 360 }}>
            <input
              style={{ width: "100%", padding: "10px 16px", background: "#111118", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 2, color: "#ccc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
              placeholder="Filtrar por tribunal, comarca ou órgão..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <p style={{ color: "#444", fontSize: 13 }}>Carregando juízos...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: 48, textAlign: "center" }}>
              <p style={{ color: "#444", fontSize: 14, fontWeight: 300 }}>
                {search ? "Nenhum juízo encontrado." : "Nenhum juízo cadastrado ainda."}
              </p>
              {!search && (
                <button onClick={() => setModal("new")} style={{ marginTop: 16, background: "none", border: "none", color: "#d4af37", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cadastrar primeiro juízo →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map((j) => (
                <JuizoCard key={j.id} juizo={j} onEdit={setModal} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <JuizoModal
          juizo={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchJuizos}
        />
      )}
    </div>
  );
}