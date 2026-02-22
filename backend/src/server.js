const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
console.log("AuthRoutes carregado:", authRoutes);
const app = express();


app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/debug", (req, res) => {
  res.json({ debug: true });
});

app.get("/", (req, res) => {
  res.json({ message: "API funcionando" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});