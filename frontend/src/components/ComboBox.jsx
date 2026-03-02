import { useState, useEffect, useRef } from "react";
import api from "../services/api";

export default function ComboBox({
  label, endpoint, getLabel, onSelect,
  placeholder, initialValue = "", error,
}) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (selected) return;
    const delay = setTimeout(async () => {
      if (!query.trim()) { setResults([]); setOpen(false); return; }
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`${endpoint}?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
        setOpen(res.data.length > 0);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(delay);
  }, [query, selected, endpoint]);

  const handleSelect = (item) => {
    setSelected(item);
    setQuery(getLabel(item));
    setResults([]);
    setOpen(false);
    onSelect(item, null);
  };

  const handleChange = (e) => {
    setSelected(null);
    setQuery(e.target.value);
    onSelect(null, e.target.value);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    onSelect(null, "");
  };

  const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 500,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#666", fontFamily: "'DM Sans', sans-serif", marginBottom: 6,
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "10px 36px 10px 14px", background: "#0d0d14",
            border: `1px solid ${error ? "#cc3333" : selected ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.2)"}`,
            borderRadius: 2, color: "#e0d5b8", fontSize: 13,
            fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
          }}
        />
        {query && (
          <button onClick={handleClear}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: 0 }}>
            ✕
          </button>
        )}
      </div>
      {selected && (
        <span style={{ fontSize: 10, color: "#d4af37", fontFamily: "'DM Sans', sans-serif", marginTop: 3, display: "block" }}>
          ✓ encontrado no banco
        </span>
      )}
      {!selected && query && (
        <span style={{ fontSize: 10, color: "#666", fontFamily: "'DM Sans', sans-serif", marginTop: 3, display: "block" }}>
          ✎ será salvo como texto livre
        </span>
      )}
      {error && <span style={{ fontSize: 11, color: "#ff6666", marginTop: 4, display: "block" }}>{error}</span>}

      {open && results.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 300, background: "#111118", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 2, maxHeight: 200, overflowY: "auto" }}>
          {results.map((item) => (
            <button key={item.id} onClick={() => handleSelect(item)}
              style={{ width: "100%", padding: "10px 14px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#ccc", fontSize: 13, fontFamily: "'DM Sans', sans-serif", textAlign: "left", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {getLabel(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}