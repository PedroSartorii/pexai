import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const STATUS_OPTIONS = [
  { value: "PENDENTE", label: "Pendente", color: "#f59e0b" },
  { value: "PAGO",     label: "Pago",     color: "#22c55e" },
  { value: "ATRASADO", label: "Atrasado", color: "#ef4444" },
];

const EMPTY_FORM = {
  processoId: "",
  valorTotal: "",
  status: "PENDENTE",
  dataVencimento: "",
  dataRecebimento: "",
  descricao: "",
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const LancamentoModal = ({ lancamento, processos, onClose, onSaved }) => {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...(lancamento || {}),
    valorTotal:      lancamento?.valorTotal ?? "",
    dataVencimento:  lancamento?.dataVencimento  ? lancamento.dataVencimento.slice(0, 10)  : "",
    dataRecebimento: lancamento?.dataRecebimento ? lancamento.dataRecebimento.slice(0, 10) : "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    const e = {};
    if (!form.processoId)   e.processoId   = "Obrigatório";
    if (!form.valorTotal)   e.valorTotal   = "Obrigatório";
    if (!form.dataVencimento) e.dataVencimento = "Obrigatório";
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        ...form,
        valorTotal: parseFloat(form.valorTotal),
        dataRecebimento: form.dataRecebimento || null,
      };
      lancamento
        ? await api.put(`/lancamentos/${lancamento.id}`, payload, { headers })
        : await api.post("/lancamentos", payload, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar lançamento.");
    } finally { setLoading(false); }
  };

  const iS = (error) => ({
    width: "100%", padding: "10px 14px", background: "#0d0d14",
    border: `1px solid ${error ? "#cc3333" : "rgba(212,175,55,0.2)"}`,
    borderRadius: 2, color: "#e0d5b8", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
  });

  const lS = {
    display: "block", fontSize: 10, fontWeight: 500,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#666", fontFamily: "'DM Sans', sans-serif", marginBottom: 6,
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", padding: 16 }}>
      <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 560, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {lancamento ? "Editar" : "Novo"}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#f0e6c8" }}>
              {lancamento ? "Editar Lançamento" : "Novo Lançamento"}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Processo */}
          <div>
            <label style={lS}>Processo *</label>
            <select value={form.processoId} onChange={set("processoId")} style={{ ...iS(errors.processoId), cursor: "pointer" }}>
              <option value="">Selecione um processo...</option>
              {processos.map(p => (
                <option key={p.id} value={p.id}>{p.titulo}</option>
              ))}
            </select>
            {errors.processoId && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.processoId}</span>}
          </div>

          {/* Descrição */}
          <div>
            <label style={lS}>Descrição</label>
            <input placeholder="Ex: Honorários iniciais, 1ª parcela..." value={form.descricao} onChange={set("descricao")} style={iS(false)} />
          </div>

          {/* Valor e Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lS}>Valor Total (R$) *</label>
              <input type="number" min="0" step="0.01" placeholder="0,00" value={form.valorTotal} onChange={set("valorTotal")} style={iS(errors.valorTotal)} />
              {errors.valorTotal && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.valorTotal}</span>}
            </div>
            <div>
              <label style={lS}>Data de Vencimento *</label>
              <input type="date" value={form.dataVencimento} onChange={set("dataVencimento")} style={iS(errors.dataVencimento)} />
              {errors.dataVencimento && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.dataVencimento}</span>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={lS}>Status *</label>
            <div style={{ display: "flex", gap: 10 }}>
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setForm(f => ({ ...f, status: opt.value }))}
                  style={{
                    flex: 1, padding: "10px 8px",
                    background: form.status === opt.value ? `${opt.color}18` : "transparent",
                    border: `1px solid ${form.status === opt.value ? `${opt.color}66` : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2,
                    color: form.status === opt.value ? opt.color : "#555",
                    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data de Recebimento (só se PAGO) */}
          {form.status === "PAGO" && (
            <div>
              <label style={lS}>Data de Recebimento</label>
              <input type="date" value={form.dataRecebimento} onChange={set("dataRecebimento")} style={iS(false)} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 28px", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
          <button onClick={onClose}
            style={{ padding: "10px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, color: "#666", fontSize: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}
            style={{ padding: "10px 28px", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Salvando..." : lancamento ? "Salvar Alterações" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal de Repasse ─────────────────────────────────────────────────────────
const RepasseModal = ({ repasse, processos, onClose, onSaved }) => {
  const [form, setForm] = useState({
    processoId: repasse?.processoId || "",
    parceiro: repasse?.parceiro || "",
    percentual: repasse?.percentual ?? "",
    pago: repasse?.pago || false,
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    const e = {};
    if (!form.processoId)  e.processoId  = "Obrigatório";
    if (!form.parceiro)    e.parceiro    = "Obrigatório";
    if (!form.percentual)  e.percentual  = "Obrigatório";
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { ...form, percentual: parseFloat(form.percentual) };
      repasse
        ? await api.put(`/repassess/${repasse.id}`, payload, { headers })
        : await api.post("/repassess", payload, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar repasse.");
    } finally { setLoading(false); }
  };

  const iS = (error) => ({
    width: "100%", padding: "10px 14px", background: "#0d0d14",
    border: `1px solid ${error ? "#cc3333" : "rgba(212,175,55,0.2)"}`,
    borderRadius: 2, color: "#e0d5b8", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
  });

  const lS = {
    display: "block", fontSize: 10, fontWeight: 500,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#666", fontFamily: "'DM Sans', sans-serif", marginBottom: 6,
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", padding: 16 }}>
      <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {repasse ? "Editar" : "Novo"}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#f0e6c8" }}>
              {repasse ? "Editar Repasse" : "Novo Repasse"}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={lS}>Processo *</label>
            <select value={form.processoId} onChange={set("processoId")} style={{ ...iS(errors.processoId), cursor: "pointer" }}>
              <option value="">Selecione um processo...</option>
              {processos.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </select>
            {errors.processoId && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.processoId}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lS}>Nome do Parceiro *</label>
              <input placeholder="Ex: Dr. João Silva" value={form.parceiro} onChange={set("parceiro")} style={iS(errors.parceiro)} />
              {errors.parceiro && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.parceiro}</span>}
            </div>
            <div>
              <label style={lS}>Percentual (%) *</label>
              <input type="number" min="0" max="100" step="0.1" placeholder="Ex: 30" value={form.percentual} onChange={set("percentual")} style={iS(errors.percentual)} />
              {errors.percentual && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.percentual}</span>}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" id="pago" checked={form.pago}
              onChange={e => setForm(f => ({ ...f, pago: e.target.checked }))} />
            <label htmlFor="pago" style={{ ...lS, marginBottom: 0, color: form.pago ? "#22c55e" : "#555" }}>
              {form.pago ? "Repasse já realizado" : "Repasse pendente"}
            </label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 28px", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
          <button onClick={onClose}
            style={{ padding: "10px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, color: "#666", fontSize: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}
            style={{ padding: "10px 28px", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Salvando..." : repasse ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card Lançamento ──────────────────────────────────────────────────────────
const LancamentoCard = ({ lancamento, onEdit, onDelete }) => {
  const status = STATUS_OPTIONS.find(s => s.value === lancamento.status);
  return (
    <div
      style={{ background: "#111118", border: `1px solid ${status.color}22`, borderLeft: `3px solid ${status.color}`, borderRadius: 4, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${status.color}55`}
      onMouseLeave={e => e.currentTarget.style.borderColor = `${status.color}22`}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "#f0e6c8", marginBottom: 4 }}>
            {lancamento.processo?.titulo || "Processo"}
          </p>
          {lancamento.descricao && (
            <p style={{ fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{lancamento.descricao}</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onEdit(lancamento)}
            style={{ padding: "4px 10px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}>
            Editar
          </button>
          <button onClick={() => onDelete(lancamento.id)}
            style={{ padding: "4px 10px", background: "transparent", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.2)"; }}>
            Excluir
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <div>
          <p style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Valor</p>
          <p style={{ fontSize: 15, color: "#d4af37", fontFamily: "'Cormorant Garamond', serif" }}>
            {Number(lancamento.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Vencimento</p>
          <p style={{ fontSize: 12, color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}>
            {new Date(lancamento.dataVencimento).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Status</p>
          <span style={{ fontSize: 10, padding: "2px 8px", background: `${status.color}18`, border: `1px solid ${status.color}44`, borderRadius: 2, color: status.color, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Card Repasse ─────────────────────────────────────────────────────────────
const RepasseCard = ({ repasse, onEdit, onDelete }) => (
  <div
    style={{ background: "#111118", border: "1px solid rgba(96,165,250,0.15)", borderLeft: "3px solid #60a5fa", borderRadius: 4, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10, transition: "border-color 0.2s" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(96,165,250,0.35)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(96,165,250,0.15)"}
  >
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "#f0e6c8", marginBottom: 2 }}>
          {repasse.parceiro}
        </p>
        <p style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
          {repasse.processo?.titulo}
        </p>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onEdit(repasse)}
          style={{ padding: "4px 10px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}>
          Editar
        </button>
        <button onClick={() => onDelete(repasse.id)}
          style={{ padding: "4px 10px", background: "transparent", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.2)"; }}>
          Excluir
        </button>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div>
        <p style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Percentual</p>
        <p style={{ fontSize: 18, color: "#60a5fa", fontFamily: "'Cormorant Garamond', serif" }}>{repasse.percentual}%</p>
      </div>
      <div>
        <p style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Status</p>
        <span style={{ fontSize: 10, padding: "2px 8px", background: repasse.pago ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${repasse.pago ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`, borderRadius: 2, color: repasse.pago ? "#22c55e" : "#f59e0b", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.08em" }}>
          {repasse.pago ? "Pago" : "Pendente"}
        </span>
      </div>
    </div>
  </div>
);

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function LancamentoRegister() {
  const navigate = useNavigate();
  const [tab, setTab]                 = useState("lancamentos");
  const [lancamentos, setLancamentos] = useState([]);
  const [repassess, setRepassess]     = useState([]);
  const [processos, setProcessos]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [search, setSearch]           = useState("");

  const token = () => localStorage.getItem("token");
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchTudo = async () => {
    setLoading(true);
    try {
      const [resL, resR, resP] = await Promise.all([
        api.get("/lancamentos", { headers: headers() }),
        api.get("/repassess",   { headers: headers() }),
        api.get("/processos",   { headers: headers() }),
      ]);
      setLancamentos(resL.data);
      setRepassess(resR.data);
      setProcessos(resP.data);
    } catch { alert("Erro ao carregar dados."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTudo(); }, []);

  const handleDeleteLancamento = async (id) => {
    if (!confirm("Deseja excluir este lançamento?")) return;
    try {
      await api.delete(`/lancamentos/${id}`, { headers: headers() });
      setLancamentos(prev => prev.filter(l => l.id !== id));
    } catch { alert("Erro ao excluir."); }
  };

  const handleDeleteRepasse = async (id) => {
    if (!confirm("Deseja excluir este repasse?")) return;
    try {
      await api.delete(`/repassess/${id}`, { headers: headers() });
      setRepassess(prev => prev.filter(r => r.id !== id));
    } catch { alert("Erro ao excluir."); }
  };

  const filteredLancamentos = lancamentos.filter(l =>
    (l.processo?.titulo || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.descricao || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredRepassess = repassess.filter(r =>
    (r.parceiro || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.processo?.titulo || "").toLowerCase().includes(search.toLowerCase())
  );

  const tabStyle = (id) => ({
    padding: "10px 24px", background: "transparent",
    border: "none", borderBottom: `2px solid ${tab === id ? "#d4af37" : "transparent"}`,
    color: tab === id ? "#d4af37" : "#555",
    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.08em", textTransform: "uppercase",
    cursor: "pointer", transition: "all 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

      <div style={{ marginLeft: 220, flex: 1 }}>

        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Financeiro</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f0e6c8" }}>Lançamentos & Repassess</h1>
          </div>
          <button onClick={() => setModal(tab === "lancamentos" ? "new-lancamento" : "new-repasse")}
            style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}>
            + {tab === "lancamentos" ? "Novo Lançamento" : "Novo Repasse"}
          </button>
        </header>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 48px" }}>
          <button style={tabStyle("lancamentos")} onClick={() => setTab("lancamentos")}>
            Lançamentos ({lancamentos.length})
          </button>
          <button style={tabStyle("repassess")} onClick={() => setTab("repassess")}>
            Repassess ({repassess.length})
          </button>
        </div>

        <main style={{ padding: "32px 48px" }}>
          {/* Filtro */}
          <div style={{ marginBottom: 24, maxWidth: 360 }}>
            <input
              style={{ width: "100%", padding: "10px 16px", background: "#111118", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 2, color: "#ccc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
              placeholder={tab === "lancamentos" ? "Filtrar por processo ou descrição..." : "Filtrar por parceiro ou processo..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p style={{ color: "#444", fontSize: 13 }}>Carregando...</p>
          ) : (
            <>
              {/* Tab Lançamentos */}
              {tab === "lancamentos" && (
                filteredLancamentos.length === 0 ? (
                  <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: 48, textAlign: "center" }}>
                    <p style={{ color: "#444", fontSize: 14 }}>{search ? "Nenhum lançamento encontrado." : "Nenhum lançamento cadastrado ainda."}</p>
                    {!search && <button onClick={() => setModal("new-lancamento")} style={{ marginTop: 16, background: "none", border: "none", color: "#d4af37", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cadastrar primeiro lançamento →</button>}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filteredLancamentos.map(l => (
                      <LancamentoCard key={l.id} lancamento={l} onEdit={setModal} onDelete={handleDeleteLancamento} />
                    ))}
                  </div>
                )
              )}

              {/* Tab Repassess */}
              {tab === "repassess" && (
                filteredRepassess.length === 0 ? (
                  <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: 48, textAlign: "center" }}>
                    <p style={{ color: "#444", fontSize: 14 }}>{search ? "Nenhum repasse encontrado." : "Nenhum repasse cadastrado ainda."}</p>
                    {!search && <button onClick={() => setModal("new-repasse")} style={{ marginTop: 16, background: "none", border: "none", color: "#d4af37", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cadastrar primeiro repasse →</button>}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {filteredRepassess.map(r => (
                      <RepasseCard key={r.id} repasse={r} onEdit={setModal} onDelete={handleDeleteRepasse} />
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </main>
      </div>

      {/* Modais */}
      {(modal === "new-lancamento" || (modal && modal.valorTotal !== undefined)) && (
        <LancamentoModal
          lancamento={modal === "new-lancamento" ? null : modal}
          processos={processos}
          onClose={() => setModal(null)}
          onSaved={fetchTudo}
        />
      )}
      {(modal === "new-repasse" || (modal && modal.percentual !== undefined)) && (
        <RepasseModal
          repasse={modal === "new-repasse" ? null : modal}
          processos={processos}
          onClose={() => setModal(null)}
          onSaved={fetchTudo}
        />
      )}
    </div>
  );
}