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

app.use("/auth", authRoutes);
app.use("/process", processRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API PexAI funcionando" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("CRASH - uncaughtException:", err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("CRASH - unhandledRejection:", reason);
});