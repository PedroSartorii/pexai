const { Router } = require("express");
const { gerar, listar } = require("../controllers/licencaController");

const router = Router();
router.post("/", gerar);
router.post("/listar", listar);

module.exports = router;