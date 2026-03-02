const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/processoController");

// Buscas para ComboBox (antes das rotas com :id)
router.get("/search/clientes", auth, ctrl.searchClientes);
router.get("/search/qualificacoes", auth, ctrl.searchQualificacoes);

// CRUD
router.get("/", auth, ctrl.list);
router.get("/:id", auth, ctrl.getOne);
router.post("/", auth, ctrl.create);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.remove);

// IA e DOCX
router.post("/:id/gerar-minuta", auth, ctrl.gerarMinuta);
router.get("/:id/docx", auth, ctrl.downloadDocx);

module.exports = router;