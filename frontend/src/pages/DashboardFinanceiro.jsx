import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

// ─── Constantes ───────────────────────────────────────────────────────────────
const CORES_STATUS = {
  PAGO:     { color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  label: "Pago" },
  PENDENTE: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", label: "Pendente" },
  ATRASADO: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  label: "Atrasado" },
};

const CORES_AREA = [
  "#d4af37","#60a5fa","#22c55e","#f59e0b",
  "#ef4444","#a78bfa","#34d399","#fb923c","#f472b6","#38bdf8","#84cc16",
];

const BR = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, color = "#d4af37", icon }) => (
  <div
    style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 8, transition: "border-color 0.2s" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)"}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
    </div>
    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: "#444", fontFamily: "'DM Sans', sans-serif" }}>{sub}</p>}
  </div>
);

// ─── Tooltip customizado ──────────────────────────────────────────────────────
const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 3, padding: "10px 14px" }}>
      <p style={{ fontSize: 11, color: "#d4af37", fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.color, fontFamily: "'DM Sans', sans-serif" }}>
          {p.name}: {BR(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Pie Label ────────────────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Section Title ────────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "32px 0 20px" }}>
    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
      {children}
    </span>
    <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
  </div>
);

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function DashboardFinanceiro() {
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState({ clienteId: null, previsaoDias: "30" });
  const [dados, setDados]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // Busca clientes para dropdown de filtro
  useEffect(() => {
    const token = localStorage.getItem("token");
    api.get(`/dashboard/clientes?q=${busca}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setClientes(r.data))
      .catch(() => {});
  }, [busca]);

  // Busca dados do dashboard quando filtro muda
  const fetchDados = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filtro.clienteId) params.set("clienteId", filtro.clienteId);
      params.set("previsaoDias", filtro.previsaoDias);
      const res = await api.get(`/dashboard/financeiro?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDados(res.data);
    } catch { alert("Erro ao carregar dashboard."); }
    finally { setLoading(false); }
  }, [filtro]);

  useEffect(() => { fetchDados(); }, [fetchDados]);

  const selecionarCliente = (c) => {
    setClienteSelecionado(c);
    setFiltro(f => ({ ...f, clienteId: c.id }));
    setMostrarClientes(false);
    setBusca("");
  };

  const limparFiltro = () => {
    setClienteSelecionado(null);
    setFiltro(f => ({ ...f, clienteId: null }));
  };

  const axisStyle = { fontSize: 10, fontFamily: "'DM Sans', sans-serif", fill: "#555" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

      <div style={{ marginLeft: 220, flex: 1 }}>

        {/* ── Header ── */}
        <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, background: "#0a0a0f", zIndex: 10 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Financeiro</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f0e6c8" }}>Dashboard Financeiro</h1>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* Toggle previsão dias */}
            <div style={{ display: "flex", gap: 4 }}>
              {["30", "60", "90"].map(d => (
                <button key={d} onClick={() => setFiltro(f => ({ ...f, previsaoDias: d }))}
                  style={{ padding: "6px 14px", background: filtro.previsaoDias === d ? "rgba(212,175,55,0.15)" : "transparent", border: `1px solid ${filtro.previsaoDias === d ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 2, color: filtro.previsaoDias === d ? "#d4af37" : "#555", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                  {d}d
                </button>
              ))}
            </div>

            {/* Filtro por cliente */}
            <div style={{ position: "relative" }}>
              {clienteSelecionado ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 2 }}>
                  <span style={{ fontSize: 12, color: "#d4af37", fontFamily: "'DM Sans', sans-serif" }}>
                    👤 {clienteSelecionado.nome}
                  </span>
                  <button onClick={limparFiltro}
                    style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, padding: 0 }}>✕</button>
                </div>
              ) : (
                <>
                  <input
                    placeholder="Filtrar por cliente..."
                    value={busca}
                    onChange={e => { setBusca(e.target.value); setMostrarClientes(true); }}
                    onFocus={() => setMostrarClientes(true)}
                    onBlur={() => setTimeout(() => setMostrarClientes(false), 200)}
                    style={{ padding: "7px 14px", background: "#111118", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 2, color: "#ccc", fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none", width: 220 }}
                  />
                  {mostrarClientes && clientes.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, marginTop: 4, maxHeight: 200, overflowY: "auto" }}>
                      {clientes.map(c => (
                        <button key={c.id} onClick={() => selecionarCliente(c)}
                          style={{ width: "100%", padding: "10px 14px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#ccc", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textAlign: "left", cursor: "pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          {c.nome}
                          <span style={{ fontSize: 10, color: "#555", marginLeft: 8 }}>{c.cpfCnpj}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        <main style={{ padding: "32px 48px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <p style={{ color: "#444", fontSize: 13 }}>Carregando dashboard...</p>
            </div>
          ) : dados ? (
            <>
              {/* ── LTV Banner ── */}
              {dados.ltv && (
                <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, padding: "20px 28px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                      Visão do Cliente — LTV
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#f0e6c8" }}>
                      {dados.ltv.cliente?.nome}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 32 }}>
                    {[
                      { label: "Processos",    value: dados.ltv.totalProcessos },
                      { label: "Recebido",     value: BR(dados.ltv.totalRecebido) },
                      { label: "Líquido",      value: BR(dados.ltv.totalLiquido) },
                      { label: "Inadimplência",value: BR(dados.ltv.inadimplencia), color: dados.ltv.inadimplencia > 0 ? "#ef4444" : "#22c55e" },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: "center" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: item.color || "#f0e6c8" }}>{item.value}</p>
                        <p style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Sans', sans-serif" }}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── KPIs ── */}
              <SectionTitle>Resumo Financeiro</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <KPICard label="Faturamento Total"       value={BR(dados.kpis.faturamento)}    sub="Honorários recebidos"         color="#22c55e" icon="💰" />
                <KPICard label="Inadimplência"           value={BR(dados.kpis.inadimplencia)}  sub="Vencidos e não pagos"         color={dados.kpis.inadimplencia > 0 ? "#ef4444" : "#22c55e"} icon="⚠️" />
                <KPICard label={`Previsão ${dados.kpis.previsaoDias}d`} value={BR(dados.kpis.previsao)} sub="A vencer no período" color="#f59e0b" icon="📅" />
                <KPICard label="Saldo Repassess"         value={BR(dados.kpis.saldoRepassess)} sub="A repassar a parceiros"       color="#60a5fa" icon="🤝" />
              </div>

              {/* ── Gráficos ── */}
              <SectionTitle>Análise Visual</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

                {/* Evolução mensal */}
                <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px" }}>
                  <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
                    Evolução Mensal — Previsto vs. Recebido
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={dados.evolucaoMensal} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                      <XAxis dataKey="mes" tick={axisStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<TooltipCustom />} />
                      <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "#666" }} />
                      <Bar dataKey="previsto" name="Previsto" fill="rgba(212,175,55,0.15)" radius={[2, 2, 0, 0]} />
                      <Line dataKey="recebido" name="Recebido" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 3 }} type="monotone" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Status pagamentos */}
                <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px" }}>
                  <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
                    Status de Pagamentos
                  </p>
                  {dados.statusPagamentos.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#444", fontSize: 12 }}>Sem dados</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={dados.statusPagamentos}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={80}
                            dataKey="valor" nameKey="status"
                            labelLine={false} label={renderPieLabel}
                          >
                            {dados.statusPagamentos.map((entry, i) => (
                              <Cell key={i} fill={CORES_STATUS[entry.status]?.color || "#888"} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v, n) => [BR(v), CORES_STATUS[n]?.label || n]}
                            contentStyle={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 3, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                        {dados.statusPagamentos.map((s, i) => {
                          const cor = CORES_STATUS[s.status];
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cor?.color }} />
                                <span style={{ fontSize: 11, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>{cor?.label} ({s.count})</span>
                              </div>
                              <span style={{ fontSize: 11, color: cor?.color, fontFamily: "'DM Sans', sans-serif" }}>{BR(s.valor)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Composição por área */}
              {dados.composicaoArea.length > 0 && (
                <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px", marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
                    Receita por Área do Direito
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={dados.composicaoArea} cx="50%" cy="50%" outerRadius={90} dataKey="valor" nameKey="area" labelLine={false} label={renderPieLabel}>
                          {dados.composicaoArea.map((_, i) => <Cell key={i} fill={CORES_AREA[i % CORES_AREA.length]} />)}
                        </Pie>
                        <Tooltip
                          formatter={v => BR(v)}
                          contentStyle={{ background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 3, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {dados.composicaoArea.map((item, i) => {
                        const total = dados.composicaoArea.reduce((s, a) => s + a.valor, 0);
                        const pct = total > 0 ? ((item.valor / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: CORES_AREA[i % CORES_AREA.length], flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{ fontSize: 11, color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}>{item.area}</span>
                                <span style={{ fontSize: 11, color: "#d4af37", fontFamily: "'DM Sans', sans-serif" }}>{pct}%</span>
                              </div>
                              <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: CORES_AREA[i % CORES_AREA.length], borderRadius: 2, transition: "width 0.5s" }} />
                              </div>
                            </div>
                            <span style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif", minWidth: 80, textAlign: "right" }}>{BR(item.valor)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tabela Honorários Líquidos ── */}
              <SectionTitle>Honorários por Processo</SectionTitle>
              {dados.honorariosLiquidos.length === 0 ? (
                <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: 48, textAlign: "center" }}>
                  <p style={{ color: "#444", fontSize: 13 }}>Nenhum lançamento encontrado.</p>
                </div>
              ) : (
                <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: "1px solid rgba(212,175,55,0.1)", background: "#0d0d14" }}>
                    {["Processo", "Bruto", "Repassess", "Custos", "Líquido", "Clientes"].map(h => (
                      <p key={h} style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{h}</p>
                    ))}
                  </div>

                  {/* Linhas */}
                  {dados.honorariosLiquidos.map((p, i) => (
                    <div key={p.processoId}
                      style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: i < dados.honorariosLiquidos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.03)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div>
                        <p style={{ fontSize: 13, color: "#e0d5b8", fontFamily: "'Cormorant Garamond', serif" }}>{p.titulo}</p>
                        <p style={{ fontSize: 10, color: "#555", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{p.area}</p>
                      </div>
                      <p style={{ fontSize: 12, color: "#aaa", fontFamily: "'DM Sans', sans-serif", alignSelf: "center" }}>{BR(p.totalBruto)}</p>
                      <p style={{ fontSize: 12, color: "#60a5fa", fontFamily: "'DM Sans', sans-serif", alignSelf: "center" }}>{p.totalRepassess > 0 ? `- ${BR(p.totalRepassess)}` : "—"}</p>
                      <p style={{ fontSize: 12, color: "#f59e0b", fontFamily: "'DM Sans', sans-serif", alignSelf: "center" }}>{p.totalCustos > 0 ? `- ${BR(p.totalCustos)}` : "—"}</p>
                      <p style={{ fontSize: 13, color: p.liquido >= 0 ? "#22c55e" : "#ef4444", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, alignSelf: "center" }}>{BR(p.liquido)}</p>
                      <p style={{ fontSize: 11, color: "#666", fontFamily: "'DM Sans', sans-serif", alignSelf: "center" }}>{p.clientes || "—"}</p>
                    </div>
                  ))}

                  {/* Totais */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "14px 20px", background: "#0d0d14", borderTop: "1px solid rgba(212,175,55,0.15)" }}>
                    <p style={{ fontSize: 11, color: "#d4af37", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</p>
                    <p style={{ fontSize: 12, color: "#d4af37", fontFamily: "'DM Sans', sans-serif" }}>{BR(dados.honorariosLiquidos.reduce((s, p) => s + p.totalBruto, 0))}</p>
                    <p style={{ fontSize: 12, color: "#60a5fa", fontFamily: "'DM Sans', sans-serif" }}>- {BR(dados.honorariosLiquidos.reduce((s, p) => s + p.totalRepassess, 0))}</p>
                    <p style={{ fontSize: 12, color: "#f59e0b", fontFamily: "'DM Sans', sans-serif" }}>- {BR(dados.honorariosLiquidos.reduce((s, p) => s + p.totalCustos, 0))}</p>
                    <p style={{ fontSize: 13, color: "#22c55e", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{BR(dados.honorariosLiquidos.reduce((s, p) => s + p.liquido, 0))}</p>
                    <span />
                  </div>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}