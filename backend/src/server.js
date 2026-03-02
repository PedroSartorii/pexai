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
app.get("/health", (req, res) => res.status(200).send("OK"));
app.use("/auth", authRoutes);
app.use("/process", processRoutes);
app.use("/clients", clientRoutes);
app.use("/qualifications", qualificationRoutes);
app.use("/process-titles", processTitleRoutes);
app.use("/juizos", juizoRoutes);
app.use("/acoes", acaoRoutes);
app.use("/processos", processoRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API PexAI funcionando" });
});

const PORT = process.env.PORT || 8080; // Para voltar em produção, rodar na porta 8080

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});