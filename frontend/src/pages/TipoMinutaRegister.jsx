import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

// ─── Estilos compartilhados ───────────────────────────────────────────────────
const s = {
  page: {
  minHeight: "100vh", background: "#07070f",
  fontFamily: "'DM Sans', sans-serif",
  },
  main: { marginLeft: 220, padding: "40px 48px", overflowY: "auto", minHeight: "100vh" },
  header: { marginBottom: 32 },
  title: { fontSize: 22, fontWeight: 300, color: "#f0e6c8", margin: 0, letterSpacing: "0.02em" },
  subtitle: { fontSize: 12, color: "#555", marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" },

  card: {
    background: "#0d0d14", border: "1px solid rgba(212,175,55,0.15)",
    borderRadius: 4, padding: "28px 32px", marginBottom: 16,
  },
  label: {
    display: "block", fontSize: 10, fontWeight: 500,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#666", marginBottom: 6,
  },
  input: (err) => ({
    width: "100%", padding: "10px 14px", background: "#0a0a12",
    border: `1px solid ${err ? "#cc3333" : "rgba(212,175,55,0.2)"}`,
    borderRadius: 2, color: "#e0d5b8", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box",
  }),
  textarea: (err, rows = 4) => ({
    width: "100%", padding: "10px 14px", background: "#0a0a12",
    border: `1px solid ${err ? "#cc3333" : "rgba(212,175,55,0.2)"}`,
    borderRadius: 2, color: "#e0d5b8", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box", resize: "vertical", minHeight: rows * 24,
  }),
  errorMsg: { fontSize: 11, color: "#cc3333", marginTop: 4 },
  btnPrimary: {
    padding: "10px 28px", background: "rgba(212,175,55,0.12)",
    border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2,
    color: "#d4af37", fontSize: 12, fontWeight: 500,
    letterSpacing: "0.15em", textTransform: "uppercase",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  btnSecondary: {
    padding: "10px 28px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
    color: "#888", fontSize: 12, fontWeight: 500,
    letterSpacing: "0.15em", textTransform: "uppercase",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  btnDanger: {
    padding: "6px 16px", background: "transparent",
    border: "1px solid rgba(204,51,51,0.3)", borderRadius: 2,
    color: "#cc5555", fontSize: 11, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  fieldGroup: { marginBottom: 18 },
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const EMPTY = { nome: "", descricao: "", prompt: "" };

const TipoMinutaModal = ({ tipo, onClose, onSaved }) => {
  const [form, setForm]         = useState(tipo ? { nome: tipo.nome, descricao: tipo.descricao || "", prompt: tipo.prompt } : EMPTY);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [file, setFile]         = useState(null);
  const [fileError, setFileError] = useState("");
  const fileRef                 = useRef();

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type)) { setFileError("Apenas PDF ou DOCX."); return; }
    if (f.size > 10 * 1024 * 1024) { setFileError("Arquivo deve ter no máximo 10 MB."); return; }
    setFileError("");
    setFile(f);
  };

  const validate = () => {
    const e = {};
    if (!form.nome.trim())   e.nome   = "Obrigatório";
    if (!form.prompt.trim()) e.prompt = "Obrigatório";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const fd = new FormData();
      fd.append("nome",      form.nome);
      fd.append("descricao", form.descricao);
      fd.append("prompt",    form.prompt);
      if (file) fd.append("modelo", file);
      tipo
        ? await api.put(`/tipos-minuta/${tipo.id}`, fd, { headers })
        : await api.post("/tipos-minuta", fd, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: "#0d0d14", border: "1px solid rgba(212,175,55,0.2)",
        borderRadius: 4, width: "100%", maxWidth: 640,
        maxHeight: "90vh", overflowY: "auto", padding: "32px 36px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37" }}>
            {tipo ? "Editar Tipo de Minuta" : "Novo Tipo de Minuta"}
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Nome *</label>
          <input style={s.input(errors.nome)} value={form.nome} onChange={set("nome")} placeholder="Ex: Petição Inicial Cível" />
          {errors.nome && <p style={s.errorMsg}>{errors.nome}</p>}
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Descrição</label>
          <textarea style={s.textarea(false, 3)} value={form.descricao} onChange={set("descricao")}
            placeholder="Descreva brevemente para que serve este tipo de minuta..." />
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Prompt para IA *</label>
          <textarea style={s.textarea(errors.prompt, 6)} value={form.prompt} onChange={set("prompt")}
            placeholder="Descreva as instruções que a IA deve seguir. Use [[PARTE_AUTORA]], [[PARTE_RE]], [[DOCUMENTO]] como marcadores." />
          {errors.prompt && <p style={s.errorMsg}>{errors.prompt}</p>}
          <p style={{ fontSize: 11, color: "#555", marginTop: 6 }}>
            Marcadores disponíveis: <span style={{ color: "#d4af37" }}>[[PARTE_AUTORA]]</span> · <span style={{ color: "#d4af37" }}>[[PARTE_RE]]</span> · <span style={{ color: "#d4af37" }}>[[DOCUMENTO]]</span>
          </p>
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Documento Modelo <span style={{ color: "#555" }}>(opcional — PDF ou DOCX, máx. 10 MB)</span></label>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              border: `1px dashed ${fileError ? "#cc3333" : "rgba(212,175,55,0.25)"}`,
              borderRadius: 2, padding: "20px 16px", textAlign: "center",
              cursor: "pointer", background: "#0a0a12",
            }}
          >
            {file ? (
              <p style={{ margin: 0, fontSize: 13, color: "#d4af37" }}>📄 {file.name}</p>
            ) : tipo?.nomeArquivo ? (
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
                📄 {tipo.nomeArquivo} <span style={{ color: "#555" }}>(clique para substituir)</span>
              </p>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: 13, color: "#555" }}>Clique para selecionar um arquivo</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#444" }}>PDF ou DOCX</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handleFile} style={{ display: "none" }} />
          {fileError && <p style={s.errorMsg}>{fileError}</p>}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={s.btnSecondary} onClick={onClose} disabled={loading}>Cancelar</button>
          <button style={s.btnPrimary} onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : tipo ? "Salvar Alterações" : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const TipoMinutaCard = ({ tipo, onEdit, onDelete, onDownload }) => (
  <div style={{
    background: "#0d0d14", border: "1px solid rgba(212,175,55,0.12)",
    borderRadius: 4, padding: "20px 24px",
    display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 500, color: "#e0d5b8" }}>{tipo.nome}</p>
      {tipo.descricao && (
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666", lineHeight: 1.5 }}>{tipo.descricao}</p>
      )}
      <p style={{ margin: 0, fontSize: 11, color: "#444", lineHeight: 1.5, fontStyle: "italic",
        overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {tipo.prompt}
      </p>
      {tipo.nomeArquivo && (
        <button onClick={() => onDownload(tipo)} style={{
          marginTop: 10, background: "none", border: "none", cursor: "pointer",
          fontSize: 11, color: "#d4af37", padding: 0, display: "flex", alignItems: "center", gap: 4,
        }}>
          📄 {tipo.nomeArquivo}
        </button>
      )}
    </div>
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      <button style={s.btnSecondary} onClick={() => onEdit(tipo)}>Editar</button>
      <button style={s.btnDanger} onClick={() => onDelete(tipo)}>Excluir</button>
    </div>
  </div>
);

// ─── Página ───────────────────────────────────────────────────────────────────
export default function TipoMinutaRegister() {
  const [tipos, setTipos]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [search, setSearch]   = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get("/tipos-minuta", { headers: { Authorization: `Bearer ${token}` } });
      setTipos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (tipo) => {
    if (!confirm(`Excluir "${tipo.nome}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/tipos-minuta/${tipo.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTipos((prev) => prev.filter((t) => t.id !== tipo.id));
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao excluir.");
    }
  };

  const handleDownload = async (tipo) => {
    const token = localStorage.getItem("token");
    const res = await api.get(`/tipos-minuta/${tipo.id}/modelo`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a   = document.createElement("a");
    a.href = url; a.download = tipo.nomeArquivo; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = tipos.filter((t) =>
    t.nome.toLowerCase().includes(search.toLowerCase()) ||
    (t.descricao || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.page}>
      <Sidebar />
      <main style={s.main}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div style={s.header}>
            <h1 style={s.title}>Tipos de Minuta</h1>
            <p style={s.subtitle}>Modelos de prompt e documentos para geração de minutas</p>
          </div>
          <button style={s.btnPrimary} onClick={() => setModal("new")}>+ Novo Tipo</button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <input
            style={{ ...s.input(false), maxWidth: 360 }}
            placeholder="Buscar por nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ color: "#555", fontSize: 13 }}>Carregando...</p>
        ) : filtered.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "48px 32px" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#555" }}>
              {search ? "Nenhum resultado encontrado." : "Nenhum tipo de minuta cadastrado ainda."}
            </p>
            {!search && (
              <button style={{ ...s.btnPrimary, marginTop: 16 }} onClick={() => setModal("new")}>
                Criar primeiro tipo
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((tipo) => (
              <TipoMinutaCard
                key={tipo.id}
                tipo={tipo}
                onEdit={(t) => setModal(t)}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </main>

      {modal && (
        <TipoMinutaModal
          tipo={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}