const { Router } = require("express");
const { vendas } = require("../controllers/contatoController");

const router = Router();
router.post("/vendas", vendas);

module.exports = router;