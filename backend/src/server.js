require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const processRoutes = require("./routes/processRoutes");

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

app.get("/", (req, res) => {
  res.json({ message: "API PexAI funcionando" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});