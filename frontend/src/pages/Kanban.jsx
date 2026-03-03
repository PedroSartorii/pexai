import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

// ─── Configuração das colunas ─────────────────────────────────────────────────
const COLUNAS = [
  { id: "BACKLOG",    label: "Backlog",              sub: "Novas demandas" },
  { id: "TRIAGEM",    label: "Triagem / Análise",    sub: "Definindo estratégia" },
  { id: "PRODUCAO",   label: "Em Produção",           sub: "Redação em andamento" },
  { id: "REVISAO",    label: "Revisão / Qualidade",  sub: "Aguardando conferência" },
  { id: "AGUARDANDO", label: "Aguardando",            sub: "Cliente ou terceiros" },
  { id: "PROTOCOLO",  label: "Protocolo",             sub: "Pronto para envio" },
  { id: "CONCLUIDO",  label: "Concluído",             sub: "Arquivado" },
];

const PRIORIDADE = {
  VERMELHO: { label: "Prazo fatal",     color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)" },
  AMARELO:  { label: "Vence em breve",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)" },
  VERDE:    { label: "Prazo ok",        color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)" },
  AZUL:     { label: "Consultivo",      color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)" },
};

// Calcula prioridade automaticamente pelo prazo
function calcularPrioridade(prazoFatal, prioridadeManual) {
  if (prioridadeManual === "AZUL") return "AZUL";
  if (!prazoFatal) return prioridadeManual || "AZUL";
  const dias = Math.ceil((new Date(prazoFatal) - new Date()) / (1000 * 60 * 60 * 24));
  if (dias <= 1) return "VERMELHO";
  if (dias <= 5) return "AMARELO";
  return "VERDE";
}

function formatarPrazo(prazoFatal) {
  if (!prazoFatal) return null;
  const dias = Math.ceil((new Date(prazoFatal) - new Date()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return `Vencido há ${Math.abs(dias)}d`;
  if (dias === 0) return "Vence hoje!";
  if (dias === 1) return "Vence amanhã";
  return `${dias} dias`;
}

// ─── Modal de Card ────────────────────────────────────────────────────────────
const CardModal = ({ card, colunaInicial, onClose, onSaved }) => {
  const [form, setForm] = useState({
    titulo: "", descricao: "", coluna: colunaInicial || "BACKLOG",
    prioridade: "AZUL", prazoFatal: "", responsavel: "", processoId: "",
    ...(card || {}),
    prazoFatal: card?.prazoFatal ? card.prazoFatal.slice(0, 10) : "",
  });
  const [loading, setLoading] = useState(false);
  const [processos, setProcessos] = useState([]);

  useEffect(() => {
    // Busca processos para vincular
    const token = localStorage.getItem("token");
    api.get("/processos", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setProcessos(r.data))
      .catch(() => {});
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.titulo.trim()) { alert("Título é obrigatório."); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { ...form, processoId: form.processoId || null };
      card
        ? await api.put(`/kanban/${card.id}`, payload, { headers })
        : await api.post("/kanban", payload, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar card.");
    } finally { setLoading(false); }
  };

  const iS = {
    width: "100%", padding: "10px 14px", background: "#0d0d14",
    border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2,
    color: "#e0d5b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box",
  };

  const lS = {
    display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.15em",
    textTransform: "uppercase", color: "#666",
    fontFamily: "'DM Sans', sans-serif", marginBottom: 6,
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", padding: 16 }}>
      <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {card ? "Editar" : "Novo"} Card
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#f0e6c8" }}>
              {card ? "Editar Card" : "Novo Card"}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={lS}>Título *</label>
            <input placeholder="Ex: Contestação — Processo nº 1234" value={form.titulo} onChange={set("titulo")} style={iS} />
          </div>

          <div>
            <label style={lS}>Descrição</label>
            <textarea placeholder="Detalhes da demanda..." value={form.descricao} onChange={set("descricao")} rows={3}
              style={{ ...iS, resize: "vertical", lineHeight: 1.6 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lS}>Coluna</label>
              <select value={form.coluna} onChange={set("coluna")} style={{ ...iS, cursor: "pointer" }}>
                {COLUNAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Prazo Fatal</label>
              <input type="date" value={form.prazoFatal} onChange={set("prazoFatal")} style={iS} />
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label style={lS}>Prioridade / Cor</label>
            <div style={{ display: "flex", gap: 8 }}>
              {Object.entries(PRIORIDADE).map(([key, val]) => (
                <button key={key} onClick={() => setForm(f => ({ ...f, prioridade: key }))}
                  style={{
                    flex: 1, padding: "8px 4px",
                    background: form.prioridade === key ? val.bg : "transparent",
                    border: `1px solid ${form.prioridade === key ? val.border : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 2, color: form.prioridade === key ? val.color : "#444",
                    fontSize: 10, fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.05em", textTransform: "uppercase",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lS}>Responsável</label>
              <input placeholder="Nome do advogado" value={form.responsavel} onChange={set("responsavel")} style={iS} />
            </div>
            <div>
              <label style={lS}>Vincular Processo</label>
              <select value={form.processoId} onChange={set("processoId")} style={{ ...iS, cursor: "pointer" }}>
                <option value="">Nenhum</option>
                {processos.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
              </select>
            </div>
          </div>
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
            {loading ? "Salvando..." : card ? "Salvar" : "Criar Card"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card Kanban ──────────────────────────────────────────────────────────────
const KanbanCardItem = ({ card, onEdit, onDelete, onMover, isDragging, dragHandlers }) => {
  const prioridade = PRIORIDADE[calcularPrioridade(card.prazoFatal, card.prioridade)];
  const prazoTexto = formatarPrazo(card.prazoFatal);

  return (
    <div
      {...dragHandlers}
      style={{
        background: isDragging ? "#1a1a28" : "#111118",
        border: `1px solid ${prioridade.border}`,
        borderLeft: `3px solid ${prioridade.color}`,
        borderRadius: 3, padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 8,
        cursor: "grab", transition: "all 0.15s",
        opacity: isDragging ? 0.5 : 1,
        userSelect: "none",
      }}
    >
      {/* Título */}
      <p style={{ fontSize: 13, color: "#e0d5b8", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4, fontWeight: 400 }}>
        {card.titulo}
      </p>

      {/* Descrição */}
      {card.descricao && (
        <p style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
          {card.descricao.length > 80 ? card.descricao.slice(0, 80) + "..." : card.descricao}
        </p>
      )}

      {/* Tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, padding: "2px 7px", background: prioridade.bg, border: `1px solid ${prioridade.border}`, borderRadius: 2, color: prioridade.color, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {prioridade.label}
        </span>
        {prazoTexto && (
          <span style={{ fontSize: 9, padding: "2px 7px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>
            ⏱ {prazoTexto}
          </span>
        )}
        {card.processo && (
          <span style={{ fontSize: 9, padding: "2px 7px", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 2, color: "#d4af37", fontFamily: "'DM Sans', sans-serif" }}>
            📁 {card.processo.titulo.length > 20 ? card.processo.titulo.slice(0, 20) + "..." : card.processo.titulo}
          </span>
        )}
      </div>

      {/* Footer do card */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        {card.responsavel ? (
          <span style={{ fontSize: 10, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
            👤 {card.responsavel}
          </span>
        ) : <span />}
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(card); }}
            style={{ padding: "3px 8px", background: "transparent", border: "none", color: "#444", fontSize: 10, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", borderRadius: 2, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#444"}>
            Editar
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
            style={{ padding: "3px 8px", background: "transparent", border: "none", color: "#444", fontSize: 10, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", borderRadius: 2, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#ff6666"}
            onMouseLeave={e => e.currentTarget.style.color = "#444"}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Coluna Kanban ────────────────────────────────────────────────────────────
const KanbanColuna = ({ coluna, cards, onAddCard, onEdit, onDelete, onDrop, dragOverColuna, setDragOverColuna }) => {
  const total = cards.length;
  const urgentes = cards.filter(c => calcularPrioridade(c.prazoFatal, c.prioridade) === "VERMELHO").length;

  return (
    <div
      style={{
        width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0,
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOverColuna(coluna.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(coluna.id); setDragOverColuna(null); }}
    >
      {/* Header da coluna */}
      <div style={{
        padding: "12px 16px",
        background: dragOverColuna === coluna.id ? "rgba(212,175,55,0.08)" : "#0d0d14",
        border: `1px solid ${dragOverColuna === coluna.id ? "rgba(212,175,55,0.3)" : "rgba(212,175,55,0.1)"}`,
        borderRadius: "3px 3px 0 0",
        transition: "all 0.15s",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4af37", fontFamily: "'DM Sans', sans-serif" }}>
            {coluna.label}
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {urgentes > 0 && (
              <span style={{ fontSize: 9, padding: "1px 6px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 2, color: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}>
                {urgentes} urgente{urgentes > 1 ? "s" : ""}
              </span>
            )}
            <span style={{ fontSize: 10, color: "#444", fontFamily: "'DM Sans', sans-serif" }}>{total}</span>
          </div>
        </div>
        <p style={{ fontSize: 10, color: "#444", fontFamily: "'DM Sans', sans-serif" }}>{coluna.sub}</p>
      </div>

      {/* Cards */}
      <div style={{
        flex: 1, minHeight: 80, padding: "8px",
        background: dragOverColuna === coluna.id ? "rgba(212,175,55,0.03)" : "rgba(0,0,0,0.2)",
        border: `1px solid ${dragOverColuna === coluna.id ? "rgba(212,175,55,0.2)" : "rgba(212,175,55,0.06)"}`,
        borderTop: "none",
        display: "flex", flexDirection: "column", gap: 8,
        transition: "all 0.15s",
      }}>
        {cards.map((card) => (
          <KanbanCardItem
            key={card.id}
            card={card}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandlers={{
              draggable: true,
              onDragStart: (e) => { e.dataTransfer.setData("cardId", card.id); },
            }}
          />
        ))}
      </div>

      {/* Botão adicionar */}
      <button
        onClick={() => onAddCard(coluna.id)}
        style={{
          width: "100%", padding: "10px", background: "transparent",
          border: "1px solid rgba(212,175,55,0.08)", borderTop: "none",
          borderRadius: "0 0 3px 3px", color: "#444", fontSize: 11,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.background = "rgba(212,175,55,0.04)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#444"; e.currentTarget.style.background = "transparent"; }}
      >
        + Adicionar
      </button>
    </div>
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function Kanban() {
  const navigate = useNavigate();
  const [cards, setCards]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [modal, setModal]                   = useState(null);
  const [colunaModal, setColunaModal]       = useState("BACKLOG");
  const [dragOverColuna, setDragOverColuna] = useState(null);
  const [search, setSearch]                 = useState("");

  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/kanban", { headers: { Authorization: `Bearer ${token}` } });
      setCards(res.data);
    } catch { alert("Erro ao carregar kanban."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este card?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/kanban/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCards(prev => prev.filter(c => c.id !== id));
    } catch { alert("Erro ao excluir card."); }
  };

  const handleDrop = async (novaColuna) => {
    const cardId = window._draggingCardId;
    if (!cardId) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.coluna === novaColuna) return;
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/kanban/${cardId}/mover`, { coluna: novaColuna, ordem: 0 }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, coluna: novaColuna } : c));
    } catch { alert("Erro ao mover card."); }
  };

  const cardsVisiveis = search
    ? cards.filter(c => c.titulo.toLowerCase().includes(search.toLowerCase()) || (c.responsavel || "").toLowerCase().includes(search.toLowerCase()))
    : cards;

  const cardsPorColuna = (colunaId) =>
    cardsVisiveis.filter(c => c.coluna === colunaId).sort((a, b) => a.ordem - b.ordem);

  // Estatísticas
  const totalUrgentes = cards.filter(c => calcularPrioridade(c.prazoFatal, c.prioridade) === "VERMELHO").length;
  const totalCards = cards.length;
  const totalConcluidos = cards.filter(c => c.coluna === "CONCLUIDO").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Gestão</p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f0e6c8" }}>Kanban Jurídico</h1>
            </div>
            {/* Stats */}
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Total", value: totalCards, color: "#888" },
                { label: "Urgentes", value: totalUrgentes, color: "#ef4444" },
                { label: "Concluídos", value: totalConcluidos, color: "#22c55e" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 18, fontWeight: 300, color: s.color, fontFamily: "'Cormorant Garamond', serif" }}>{s.value}</p>
                  <p style={{ fontSize: 9, color: "#444", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              placeholder="Filtrar cards..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: "8px 14px", background: "#111118", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 2, color: "#ccc", fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none", width: 200 }}
            />
            <button onClick={() => { setColunaModal("BACKLOG"); setModal("new"); }}
              style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}>
              + Novo Card
            </button>
          </div>
        </header>

        {/* Legenda de cores */}
        <div style={{ padding: "10px 32px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: "#444", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Prioridade:</span>
          {Object.entries(PRIORIDADE).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: val.color }} />
              <span style={{ fontSize: 10, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{val.label}</span>
            </div>
          ))}
        </div>

        {/* Board */}
        {loading ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ color: "#444", fontSize: 13 }}>Carregando kanban...</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowX: "auto", padding: "24px 32px", display: "flex", gap: 12, alignItems: "flex-start" }}
            onDragStart={e => { window._draggingCardId = e.target.closest("[draggable]")?.getAttribute("data-card-id") || e.dataTransfer.getData("cardId"); }}
          >
            {COLUNAS.map(coluna => (
              <KanbanColuna
                key={coluna.id}
                coluna={coluna}
                cards={cardsPorColuna(coluna.id)}
                onAddCard={(colunaId) => { setColunaModal(colunaId); setModal("new"); }}
                onEdit={setModal}
                onDelete={handleDelete}
                onDrop={handleDrop}
                dragOverColuna={dragOverColuna}
                setDragOverColuna={setDragOverColuna}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <CardModal
          card={modal === "new" ? null : modal}
          colunaInicial={colunaModal}
          onClose={() => setModal(null)}
          onSaved={fetchCards}
        />
      )}
    </div>
  );
}