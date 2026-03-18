require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const processRoutes = require("./routes/processRoutes");
const clientRoutes = require("./routes/clientRoutes");
const qualificationRoutes = require("./routes/qualificationRoutes");
const processTitleRoutes = require("./routes/processTitleRoutes");
const juizoRoutes = require("./routes/juizoRoutes");
const acaoRoutes = require("./routes/acaoRoutes");
const processoRoutes = require("./routes/processoRoutes");
const kanbanRoutes = require("./routes/kanbanRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const lancamentoRoutes = require("./routes/lancamentoRoutes");
const repasseRoutes    = require("./routes/repasseRoutes");
const contatoRoutes = require("./routes/contatoRoutes");
const licencaRoutes = require("./routes/licencaRoutes");
const tipoMinutaRoutes = require("./routes/tipoMinutaRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://pexai-one.vercel.app",
    /\.vercel\.app$/
  ],
  credentials: true
}));

app.use(express.json());

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (req, res) => res.status(200).send("OK"));
app.use("/auth", authRoutes);
app.use("/process", processRoutes);
app.use("/clients", clientRoutes);
app.use("/qualifications", qualificationRoutes);
app.use("/process-titles", processTitleRoutes);
app.use("/juizos", juizoRoutes);
app.use("/acoes", acaoRoutes);
app.use("/processos", processoRoutes);
app.use("/kanban", kanbanRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/lancamentos", lancamentoRoutes);
app.use("/repassess",   repasseRoutes);
app.use("/contato", contatoRoutes);
app.use("/admin/licencas", licencaRoutes);
app.use("/tipos-minuta", tipoMinutaRoutes);


app.get("/", (req, res) => {
  res.json({ message: "API PexAI funcionando" });
});

const PORT = process.env.PORT || 3000; // Para voltar em produção, rodar na porta 8080, se não roda na 3000

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});