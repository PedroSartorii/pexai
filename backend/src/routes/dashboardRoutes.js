const { Router } = require("express");
const ctrl = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

const router = Router();
router.use(auth);

router.get("/financeiro", ctrl.financeiro);
router.get("/clientes", ctrl.clientes);

module.exports = router;