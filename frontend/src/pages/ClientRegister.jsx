import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const EMPTY_FORM = {
  tipoPessoa: "FISICA",
  nome: "", cpfCnpj: "", rgInscricaoEstadual: "",
  estadoCivil: "", profissao: "", email: "",
  telefoneCelular: "", telefoneFixo: "", cep: "",
  logradouro: "", numero: "", complemento: "",
  bairro: "", cidade: "", uf: "",
};

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

// ─── Componentes UI ───────────────────────────────────────────────────────────
const Input = ({ label, error, className, style, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
    <label style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>
      {label}
    </label>
    <input
      style={{ padding: "10px 14px", background: "#0d0d14", border: `1px solid ${error ? "#cc3333" : "rgba(212,175,55,0.2)"}`, borderRadius: 2, color: "#e0d5b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", width: "100%" }}
      {...props}
    />
    {error && <span style={{ fontSize: 11, color: "#ff6666" }}>{error}</span>}
  </div>
);

const Select = ({ label, children, style, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
    <label style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>
      {label}
    </label>
    <select
      style={{ padding: "10px 14px", background: "#0d0d14", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#e0d5b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%" }}
      {...props}
    >
      {children}
    </select>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
      {children}
    </span>
    <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const ClientModal = ({ client, onClose, onSaved }) => {
  const [form, setForm] = useState(client ? { ...EMPTY_FORM, ...client } : EMPTY_FORM);
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
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.cpfCnpj.trim()) e.cpfCnpj = "Obrigatório";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      client
        ? await api.put(`/clients/${client.id}`, payload, { headers })
        : await api.post("/clients", payload, { headers });
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao salvar cliente.");
    } finally { setLoading(false); }
  };

  const overlay = { position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: 16 };
  const modal = { background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, width: "100%", maxWidth: 760, maxHeight: "90vh", display: "flex", flexDirection: "column" };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              {client ? "Editar" : "Novo"}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "#f0e6c8" }}>
              {client ? "Editar Cliente" : "Cadastrar Cliente"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer", padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = "#d4af37"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Tipo de Pessoa */}
          <div>
            <SectionTitle>Tipo de Pessoa</SectionTitle>
            <div style={{ display: "flex", gap: 12 }}>
              {["FISICA", "JURIDICA"].map((tipo) => (
                <button key={tipo} onClick={() => setForm((f) => ({ ...f, tipoPessoa: tipo }))}
                  style={{ flex: 1, padding: "10px", background: form.tipoPessoa === tipo ? "rgba(212,175,55,0.12)" : "transparent", border: `1px solid ${form.tipoPessoa === tipo ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 2, color: form.tipoPessoa === tipo ? "#d4af37" : "#555", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                  {tipo === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica"}
                </button>
              ))}
            </div>
          </div>

          {/* Dados Principais */}
          <div>
            <SectionTitle>Dados Principais</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label={form.tipoPessoa === "FISICA" ? "Nome Completo *" : "Razão Social *"}
                placeholder={form.tipoPessoa === "FISICA" ? "João da Silva" : "Empresa Ltda"}
                value={form.nome} onChange={set("nome")} error={errors.nome}
                style={{ gridColumn: "1 / -1" }} />
              <Input label={form.tipoPessoa === "FISICA" ? "CPF *" : "CNPJ *"}
                placeholder={form.tipoPessoa === "FISICA" ? "000.000.000-00" : "00.000.000/0000-00"}
                value={form.cpfCnpj} onChange={set("cpfCnpj")} error={errors.cpfCnpj} />
              <Input label={form.tipoPessoa === "FISICA" ? "RG" : "Inscrição Estadual"}
                placeholder="Opcional" value={form.rgInscricaoEstadual} onChange={set("rgInscricaoEstadual")} />
              {form.tipoPessoa === "FISICA" && (<>
                <Select label="Estado Civil" value={form.estadoCivil} onChange={set("estadoCivil")}>
                  <option value="">Selecione</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="uniao_estavel">União Estável</option>
                </Select>
                <Input label="Profissão" placeholder="Ex: Advogado"
                  value={form.profissao} onChange={set("profissao")} />
              </>)}
            </div>
          </div>

          {/* Contatos */}
          <div>
            <SectionTitle>Contatos</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Input label="E-mail" type="email" placeholder="email@exemplo.com"
                value={form.email} onChange={set("email")} style={{ gridColumn: "1 / -1" }} />
              <Input label="Celular" placeholder="(11) 99999-9999"
                value={form.telefoneCelular} onChange={set("telefoneCelular")} />
              <Input label="Telefone Fixo" placeholder="(11) 3333-3333"
                value={form.telefoneFixo} onChange={set("telefoneFixo")} />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <SectionTitle>Endereço</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
              <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>CEP</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input style={{ flex: 1, padding: "10px 14px", background: "#0d0d14", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#e0d5b8", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                    placeholder="00000-000" value={form.cep} onChange={set("cep")} onBlur={handleCep} />
                  {cepLoading && <span style={{ color: "#d4af37", fontSize: 12 }}>...</span>}
                </div>
              </div>
              <Input label="Logradouro" placeholder="Rua, Av..." value={form.logradouro} onChange={set("logradouro")} style={{ gridColumn: "span 3" }} />
              <Input label="Número" placeholder="123" value={form.numero} onChange={set("numero")} style={{ gridColumn: "span 1" }} />
              <Input label="Complemento" placeholder="Apto 4" value={form.complemento} onChange={set("complemento")} style={{ gridColumn: "span 2" }} />
              <Input label="Bairro" placeholder="Centro" value={form.bairro} onChange={set("bairro")} style={{ gridColumn: "span 2" }} />
              <Input label="Cidade" placeholder="São Paulo" value={form.cidade} onChange={set("cidade")} style={{ gridColumn: "span 1" }} />
              <Select label="UF" value={form.uf} onChange={set("uf")} style={{ gridColumn: "span 1" }}>
                <option value="">UF</option>
                {UF_OPTIONS.map((uf) => <option key={uf}>{uf}</option>)}
              </Select>
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
            {loading ? "Salvando..." : client ? "Salvar Alterações" : "Cadastrar Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const ClientCard = ({ client, onEdit, onDelete }) => (
  <div
    style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 4, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s", cursor: "default" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)"}
  >
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, color: "#f0e6c8", marginBottom: 4 }}>{client.nome}</p>
        <span style={{ fontSize: 10, padding: "2px 8px", border: `1px solid ${client.tipoPessoa === "FISICA" ? "rgba(100,200,100,0.3)" : "rgba(180,100,255,0.3)"}`, borderRadius: 2, color: client.tipoPessoa === "FISICA" ? "#6dc87a" : "#c084fc", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
          {client.tipoPessoa === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(client)}
          style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#d4af37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}>
          Editar
        </button>
        <button onClick={() => onDelete(client.id)}
          style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(200,50,50,0.2)", borderRadius: 2, color: "#888", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#ff6666"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(200,50,50,0.2)"; }}>
          Excluir
        </button>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {[
        { label: "CPF/CNPJ", value: client.cpfCnpj },
        { label: "E-mail", value: client.email },
        { label: "Celular", value: client.telefoneCelular },
        { label: "Cidade", value: client.cidade && client.uf ? `${client.cidade} - ${client.uf}` : null },
      ].filter(i => i.value).map((item) => (
        <div key={item.label}>
          <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</p>
          <p style={{ fontSize: 13, color: "#aaa", fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}>{item.value}</p>
        </div>
      ))}
    </div>

    <p style={{ fontSize: 11, color: "#333", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
      Cadastrado em {new Date(client.createdAt).toLocaleDateString("pt-BR")}
    </p>
  </div>
);

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function ClientRegister() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/clients", { headers: { Authorization: `Bearer ${token}` } });
      setClients(res.data);
    } catch {
      alert("Erro ao carregar clientes.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir este cliente?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch { alert("Erro ao excluir cliente."); }
  };

  const filtered = clients.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar onLogout={handleLogout} />

      <div style={{ marginLeft: 220, flex: 1 }}>
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(212,175,55,0.12)", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d4af37", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Gestão</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f0e6c8" }}>Clientes</h1>
          </div>
          <button onClick={() => setModal("new")}
            style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0f"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37"; }}>
            + Novo Cliente
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
            <p style={{ color: "#444", fontSize: 13 }}>Carregando clientes...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#111118", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 4, padding: 48, textAlign: "center" }}>
              <p style={{ color: "#444", fontSize: 14, fontWeight: 300 }}>
                {search ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
              </p>
              {!search && (
                <button onClick={() => setModal("new")} style={{ marginTop: 16, background: "none", border: "none", color: "#d4af37", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cadastrar primeiro cliente →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map((c) => (
                <ClientCard key={c.id} client={c} onEdit={setModal} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <ClientModal
          client={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchClients}
        />
      )}
    </div>
  );
}