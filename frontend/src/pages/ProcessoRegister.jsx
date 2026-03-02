import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import ComboBox from "../components/ComboBox";

const ACESSO_OPTIONS = [
  { value: "PUBLICO",    label: "Público" },
  { value: "PRIVADO",    label: "Privado" },
  { value: "ENVOLVIDOS", label: "Envolvidos" },
];

const INSTANCIA_OPTIONS = [
  { value: "PRIMEIRA", label: "1ª Instância" },
  { value: "SEGUNDA",  label: "2ª Instância" },
  { value: "SUPERIOR", label: "Tribunais Superiores" },
];

const CUSTO_TIPO_OPTIONS = [
  { value: "CUSTAS",     label: "Custas" },
  { value: "HONORARIOS", label: "Honorários" },
  { value: "PERICIA",    label: "Perícia" },
  { value: "DILIGENCIA", label: "Diligência" },
  { value: "OUTROS",     label: "Outros" },
];

const EMPTY_CLIENTE    = { clienteId: null, clienteLivre: "", qualificacaoId: null, qualLivre: "" };
const EMPTY_ENVOLVIDO  = { nome: "", papel: "", documento: "", contato: "" };
const EMPTY_CUSTO      = { descricao: "", valor: "", data: "", tipo: "CUSTAS", pago: false };

// ─── Estilos ──────────────────────────────────────────────────────────────────
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

const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0 16px" }}>
    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
      {children}
    </span>
    <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
  </div>
);

const AddBtn = ({ onClick, children }) => (
  <button onClick={onClick}
    style={{ padding: "8px 16px", background: "transparent", border: "1px dashed rgba(212,175,55,0.3)", borderRadius: 2, color: "#d4af37", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.6)"; e.currentTarget.style.background = "rgba(212,175,55,0.05)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; e.currentTarget.style.background = "transparent"; }}>
    + {children}
  </button>
);

const RemoveBtn = ({ onClick }) => (
  <button onClick={onClick}
    style={{ padding: "4px 10px", background: "transparent", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 2, color: "#666", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
    onMouseEnter={e => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.5)"; }}
    onMouseLeave={e => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.2)"; }}>
    Remover
  </button>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
const ProcessoCard = ({ processo, onEdit, onDelete, onGerarMinuta, onDownload, gerandoId, downloadingId }) => (
  <div
    style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)"}
  >
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#f0e6c8", marginBottom: 6 }}>{processo.titulo}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {processo.numeroProcesso && (
            <span style={{ fontSize: 10, padding: "2px 8px", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>
              Nº {processo.numeroProcesso}
            </span>
          )}
          <span style={{ fontSize: 10, padding: "2px 8px", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
            {processo.acesso}
          </span>
          {processo.instancia && (
            <span style={{ fontSize: 10, padding: "2px 8px", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>
              {INSTANCIA_OPTIONS.find(i => i.value === processo.instancia)?.label}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <button onClick={() => onGerarMinuta(processo.id)} disabled={gerandoId === processo.id}
          onMouseEnter={e => { if (gerandoId !== processo.id) { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}
          style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, color: "#d4af37", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: gerandoId === processo.id ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: gerandoId === processo.id ? 0.5 : 1 }}>
          {gerandoId === processo.id ? "Gerando..." : "⚡ Gerar Minuta"}
        </button>
        {processo.generatedText && (
          <button onClick={() => onDownload(processo.id)} disabled={downloadingId === processo.id}
            onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 2, color: "#d4af37", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: downloadingId === processo.id ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: downloadingId === processo.id ? 0.5 : 1 }}>
            {downloadingId === processo.id ? "Baixando..." : "⬇ DOCX"}
          </button>
        )}
        <button onClick={() => onEdit(processo)}
          style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}>
          Editar
        </button>
        <button onClick={() => onDelete(processo.id)}
          style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.2)"; }}>
          Excluir
        </button>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {[
        { label: "Ação", value: processo.acao?.nomeAcao || processo.acaoLivre },
        { label: "Juízo", value: processo.juizo?.orgaoJulgador || processo.juizoLivre },
        { label: "Valor da Causa", value: processo.valorCausa ? Number(processo.valorCausa).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : null },
        { label: "Responsável", value: processo.responsavel },
        { label: "Clientes", value: processo.clientes?.length ? `${processo.clientes.length} parte(s)` : null },
        { label: "Custos", value: processo.custos?.length ? `${processo.custos.length} lançamento(s)` : null },
      ].filter(i => i.value).map(item => (
        <div key={item.label}>
          <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</p>
          <p style={{ fontSize: 13, color: "#aaa", fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}>{item.value}</p>
        </div>
      ))}
    </div>

    <p style={{ fontSize: 11, color: "#333", fontFamily: "'DM Sans', sans-serif" }}>
      Criado em {new Date(processo.createdAt).toLocaleDateString("pt-BR")}
    </p>
  </div>
);

// ─── Modal de Cadastro ────────────────────────────────────────────────────────
const ProcessoModal = ({ processo, onClose, onSaved }) => {
  const [form, setForm] = useState({
    pasta: "", titulo: "", numeroProcesso: "", linkTribunal: "",
    objeto: "", valorCausa: "", distribuidoEm: "", valorCondenacao: "",
    observacoes: "", responsavel: "", acesso: "PRIVADO",
    movimentacao: "", honorarios: "", parcerias: "", prazos: "",
    juizoId: null, juizoLivre: "", acaoId: null, acaoLivre: "", instancia: "",
    ...(processo || {}),
    valorCausa: processo?.valorCausa ?? "",
    valorCondenacao: processo?.valorCondenacao ?? "",
    distribuidoEm: processo?.distribuidoEm ? processo.distribuidoEm.slice(0, 10) : "",
  });

  const [clientes, setClientes] = useState(
    processo?.clientes?.map(c => ({
      clienteId: c.clienteId, clienteLivre: c.clienteLivre || "",
      qualificacaoId: c.qualificacaoId, qualLivre: c.qualLivre || "",
    })) || [{ ...EMPTY_CLIENTE }]
  );
  const [envolvidos, setEnvolvidos]   = useState(processo?.envolvidos || []);
  const [custos, setCustos]           = useState(processo?.custos || []);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState("dados");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    const e = {};
    if (!form.titulo.trim()) e.titulo = "Obrigatório";
    if (Object.keys(e).length) { setErrors(e); setActiveTab("dados"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { ...form, clientes, envolvidos, custos };
      processo
        ? await api.put(`/processos/${processo.id}`, payload, { headers })
        : await api.post("/processos", payload, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar processo.");
    } finally { setLoading(false); }
  };

  const tabStyle = (id) => ({
    padding: "10px 20px", background: "transparent",
    border: "none", borderBottom: `2px solid ${activeTab === id ? "#d4af37" : "transparent"}`,
    color: activeTab === id ? "#d4af37" : "#555",
    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.08em", textTransform: "uppercase",
    cursor: "pointer", transition: "all 0.2s",
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", padding: 16 }}>
      <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 860, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {processo ? "Editar" : "Novo"}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#f0e6c8" }}>
              {processo ? "Editar Processo" : "Novo Processo"}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 28px" }}>
          {[
            { id: "dados",      label: "Dados Gerais" },
            { id: "partes",     label: "Partes" },
            { id: "financeiro", label: "Financeiro" },
            { id: "outros",     label: "Outros" },
          ].map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={tabStyle(t.id)}>{t.label}</button>)}
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "20px 28px", flex: 1 }}>

          {/* ── TAB DADOS ── */}
          {activeTab === "dados" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={lS}>Título *</label>
                  <input placeholder="Ex: Indenizatória contra Empresa X"
                    value={form.titulo} onChange={set("titulo")} style={iS(errors.titulo)} />
                  {errors.titulo && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{errors.titulo}</span>}
                </div>
                <div>
                  <label style={lS}>Número do Processo</label>
                  <input placeholder="0000000-00.0000.0.00.0000" value={form.numeroProcesso} onChange={set("numeroProcesso")} style={iS(false)} />
                </div>
                <div>
                  <label style={lS}>Pasta / Diretório</label>
                  <input placeholder="Ex: 2024/CIVEL/001" value={form.pasta} onChange={set("pasta")} style={iS(false)} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={lS}>Link do Tribunal</label>
                  <input placeholder="https://..." value={form.linkTribunal} onChange={set("linkTribunal")} style={iS(false)} />
                </div>
              </div>

              <SectionTitle>Classificação</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <ComboBox
                  label="Ação"
                  endpoint="/acoes/search"
                  getLabel={a => a.nomeAcao}
                  onSelect={(item, texto) => setForm(f => ({ ...f, acaoId: item?.id || null, acaoLivre: item ? null : texto }))}
                  placeholder="Buscar ou digitar ação..."
                  initialValue={processo?.acao?.nomeAcao || processo?.acaoLivre || ""}
                />
                <ComboBox
                  label="Juízo"
                  endpoint="/juizos/search"
                  getLabel={j => `${j.tribunal} — ${j.orgaoJulgador}`}
                  onSelect={(item, texto) => setForm(f => ({ ...f, juizoId: item?.id || null, juizoLivre: item ? null : texto }))}
                  placeholder="Buscar ou digitar juízo..."
                  initialValue={processo?.juizo ? `${processo.juizo.tribunal} — ${processo.juizo.orgaoJulgador}` : processo?.juizoLivre || ""}
                />
              </div>

              <div>
                <label style={lS}>Instância</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {INSTANCIA_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => setForm(f => ({ ...f, instancia: f.instancia === opt.value ? "" : opt.value }))}
                      style={{ flex: 1, padding: "10px 8px", background: form.instancia === opt.value ? "rgba(212,175,55,0.1)" : "transparent", border: `1px solid ${form.instancia === opt.value ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 2, color: form.instancia === opt.value ? "#d4af37" : "#555", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={lS}>Acesso</label>
                  <select value={form.acesso} onChange={set("acesso")} style={{ ...iS(false), cursor: "pointer" }}>
                    {ACESSO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lS}>Distribuído em</label>
                  <input type="date" value={form.distribuidoEm} onChange={set("distribuidoEm")} style={iS(false)} />
                </div>
                <div>
                  <label style={lS}>Responsável</label>
                  <input placeholder="Nome do responsável" value={form.responsavel} onChange={set("responsavel")} style={iS(false)} />
                </div>
              </div>

              <SectionTitle>Descrição</SectionTitle>
              <div>
                <label style={lS}>Objeto do Processo</label>
                <textarea placeholder="Descrição detalhada..." value={form.objeto} onChange={set("objeto")} rows={4}
                  style={{ ...iS(false), resize: "vertical", lineHeight: 1.6 }} />
              </div>
            </div>
          )}

          {/* ── TAB PARTES ── */}
          {activeTab === "partes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SectionTitle>Clientes do Processo</SectionTitle>
              {clientes.map((c, i) => (
                <div key={i} style={{ background: "#0d0d14", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 2, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Parte {i + 1}</span>
                    {clientes.length > 1 && <RemoveBtn onClick={() => setClientes(prev => prev.filter((_, idx) => idx !== i))} />}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <ComboBox
                      label="Cliente"
                      endpoint="/processos/search/clientes"
                      getLabel={cl => `${cl.nome} (${cl.cpfCnpj})`}
                      onSelect={(item, texto) => setClientes(prev => prev.map((p, idx) => idx === i ? { ...p, clienteId: item?.id || null, clienteLivre: item ? "" : texto } : p))}
                      placeholder="Buscar cliente cadastrado..."
                      initialValue={c.clienteLivre || ""}
                    />
                    <ComboBox
                      label="Qualificação"
                      endpoint="/processos/search/qualificacoes"
                      getLabel={q => q.nome}
                      onSelect={(item, texto) => setClientes(prev => prev.map((p, idx) => idx === i ? { ...p, qualificacaoId: item?.id || null, qualLivre: item ? "" : texto } : p))}
                      placeholder="Ex: Autor, Réu..."
                      initialValue={c.qualLivre || ""}
                    />
                  </div>
                </div>
              ))}
              <AddBtn onClick={() => setClientes(prev => [...prev, { ...EMPTY_CLIENTE }])}>Adicionar Cliente</AddBtn>

              <SectionTitle>Outras Partes Envolvidas</SectionTitle>
              {envolvidos.map((e, i) => (
                <div key={i} style={{ background: "#0d0d14", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 2, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Envolvido {i + 1}</span>
                    <RemoveBtn onClick={() => setEnvolvidos(prev => prev.filter((_, idx) => idx !== i))} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                      { field: "nome", label: "Nome *", placeholder: "Nome completo" },
                      { field: "papel", label: "Papel", placeholder: "Ex: Réu, Testemunha" },
                      { field: "documento", label: "CPF/CNPJ", placeholder: "000.000.000-00" },
                      { field: "contato", label: "Contato", placeholder: "E-mail ou telefone" },
                    ].map(({ field, label, placeholder }) => (
                      <div key={field}>
                        <label style={lS}>{label}</label>
                        <input placeholder={placeholder} value={e[field] || ""}
                          onChange={ev => setEnvolvidos(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: ev.target.value } : p))}
                          style={iS(false)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <AddBtn onClick={() => setEnvolvidos(prev => [...prev, { ...EMPTY_ENVOLVIDO }])}>Adicionar Envolvido</AddBtn>
            </div>
          )}

          {/* ── TAB FINANCEIRO ── */}
          {activeTab === "financeiro" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SectionTitle>Valores</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={lS}>Valor da Causa (R$)</label>
                  <input type="number" min="0" step="0.01" placeholder="0,00" value={form.valorCausa} onChange={set("valorCausa")} style={iS(false)} />
                </div>
                <div>
                  <label style={lS}>Valor da Condenação (R$)</label>
                  <input type="number" min="0" step="0.01" placeholder="0,00" value={form.valorCondenacao} onChange={set("valorCondenacao")} style={iS(false)} />
                </div>
              </div>
              <div>
                <label style={lS}>Honorários</label>
                <textarea placeholder="Regras e valores de honorários..." value={form.honorarios} onChange={set("honorarios")} rows={3} style={{ ...iS(false), resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <div>
                <label style={lS}>Parcerias Jurídicas</label>
                <textarea placeholder="Distribuição de honorários com parceiros..." value={form.parcerias} onChange={set("parcerias")} rows={3} style={{ ...iS(false), resize: "vertical", lineHeight: 1.6 }} />
              </div>

              <SectionTitle>Custos Processuais</SectionTitle>
              {custos.map((c, i) => (
                <div key={i} style={{ background: "#0d0d14", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 2, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Lançamento {i + 1} {c.id ? "(existente)" : "(novo)"}
                    </span>
                    {!c.id && <RemoveBtn onClick={() => setCustos(prev => prev.filter((_, idx) => idx !== i))} />}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={lS}>Descrição</label>
                      <input placeholder="Ex: Taxa de distribuição" value={c.descricao} disabled={!!c.id}
                        onChange={e => setCustos(prev => prev.map((p, idx) => idx === i ? { ...p, descricao: e.target.value } : p))}
                        style={iS(false)} />
                    </div>
                    <div>
                      <label style={lS}>Valor (R$)</label>
                      <input type="number" min="0" step="0.01" placeholder="0,00" value={c.valor} disabled={!!c.id}
                        onChange={e => setCustos(prev => prev.map((p, idx) => idx === i ? { ...p, valor: e.target.value } : p))}
                        style={iS(false)} />
                    </div>
                    <div>
                      <label style={lS}>Data</label>
                      <input type="date" value={c.data ? c.data.slice(0, 10) : ""} disabled={!!c.id}
                        onChange={e => setCustos(prev => prev.map((p, idx) => idx === i ? { ...p, data: e.target.value } : p))}
                        style={iS(false)} />
                    </div>
                    <div>
                      <label style={lS}>Tipo</label>
                      <select value={c.tipo} disabled={!!c.id}
                        onChange={e => setCustos(prev => prev.map((p, idx) => idx === i ? { ...p, tipo: e.target.value } : p))}
                        style={{ ...iS(false), cursor: "pointer" }}>
                        {CUSTO_TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" id={`pago-${i}`} checked={c.pago} disabled={!!c.id}
                      onChange={e => setCustos(prev => prev.map((p, idx) => idx === i ? { ...p, pago: e.target.checked } : p))} />
                    <label htmlFor={`pago-${i}`} style={{ ...lS, marginBottom: 0, color: c.pago ? "#6dc87a" : "#555" }}>
                      {c.pago ? "Pago" : "Pendente"}
                    </label>
                  </div>
                </div>
              ))}
              <AddBtn onClick={() => setCustos(prev => [...prev, { ...EMPTY_CUSTO }])}>Adicionar Custo</AddBtn>
            </div>
          )}

          {/* ── TAB OUTROS ── */}
          {activeTab === "outros" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SectionTitle>Informações Complementares</SectionTitle>
              <div>
                <label style={lS}>Movimentação Processual</label>
                <textarea placeholder="Últimas movimentações..." value={form.movimentacao} onChange={set("movimentacao")} rows={4} style={{ ...iS(false), resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <div>
                <label style={lS}>Prazos a Cumprir</label>
                <textarea placeholder="Liste os prazos e datas..." value={form.prazos} onChange={set("prazos")} rows={3} style={{ ...iS(false), resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <div>
                <label style={lS}>Observações</label>
                <textarea placeholder="Anotações livres..." value={form.observacoes} onChange={set("observacoes")} rows={4} style={{ ...iS(false), resize: "vertical", lineHeight: 1.6 }} />
              </div>
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
            {loading ? "Salvando..." : processo ? "Salvar Alterações" : "Cadastrar Processo"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal de Minuta ──────────────────────────────────────────────────────────
const MinutaModal = ({ texto, onClose }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", padding: 16 }}>
    <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#d4af37", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>IA Jurídica</p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#f0e6c8" }}>Minuta Gerada</h3>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigator.clipboard.writeText(texto)}
            style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 2, color: "#d4af37", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Copiar
          </button>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>
      </div>
      <div style={{ overflowY: "auto", padding: "24px 28px" }}>
        <pre style={{ color: "#ccc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
          {texto}
        </pre>
      </div>
    </div>
  </div>
);

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function ProcessoRegister() {
  const navigate = useNavigate();
  const [processos, setProcessos]     = useState([]);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [minuta, setMinuta]           = useState(null);
  const [gerandoId, setGerandoId]     = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchProcessos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/processos", { headers: { Authorization: `Bearer ${token}` } });
      setProcessos(res.data);
    } catch { alert("Erro ao carregar processos."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProcessos(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este processo?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/processos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProcessos(prev => prev.filter(p => p.id !== id));
    } catch { alert("Erro ao excluir processo."); }
  };

  const handleGerarMinuta = async (id) => {
    setGerandoId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(`/processos/${id}/gerar-minuta`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMinuta(res.data.texto);
      fetchProcessos(); // atualiza para mostrar botão DOCX
    } catch { alert("Erro ao gerar minuta."); }
    finally { setGerandoId(null); }
  };

  const handleDownload = async (id) => {
    setDownloadingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/processos/${id}/docx`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `processo-${id}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("Erro ao baixar DOCX."); }
    finally { setDownloadingId(null); }
  };

  const filtered = processos.filter(p =>
    p.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (p.numeroProcesso || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

      <div style={{ marginLeft: 220, flex: 1 }}>
        <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Gestão</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f0e6c8" }}>Processos</h1>
          </div>
          <button onClick={() => setModal("new")}
            style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}>
            + Novo Processo
          </button>
        </header>

        <main style={{ padding: "40px 48px" }}>
          <div style={{ marginBottom: 32, maxWidth: 400 }}>
            <input
              style={{ width: "100%", padding: "10px 16px", background: "#111118", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 2, color: "#ccc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
              placeholder="Filtrar por título ou número..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p style={{ color: "#444", fontSize: 13 }}>Carregando processos...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: 48, textAlign: "center" }}>
              <p style={{ color: "#444", fontSize: 14, fontWeight: 300 }}>
                {search ? "Nenhum processo encontrado." : "Nenhum processo cadastrado ainda."}
              </p>
              {!search && (
                <button onClick={() => setModal("new")} style={{ marginTop: 16, background: "none", border: "none", color: "#d4af37", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cadastrar primeiro processo →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map(p => (
                <ProcessoCard key={p.id} processo={p}
                  onEdit={setModal} onDelete={handleDelete}
                  onGerarMinuta={handleGerarMinuta} onDownload={handleDownload}
                  gerandoId={gerandoId} downloadingId={downloadingId}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <ProcessoModal
          processo={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchProcessos}
        />
      )}

      {minuta && <MinutaModal texto={minuta} onClose={() => setMinuta(null)} />}
    </div>
  );
}