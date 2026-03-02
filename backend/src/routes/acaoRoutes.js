const { Router } = require("express");
const acaoController = require("../controllers/acaoController");
const authMiddleware = require("../middleware/auth");

const router = Router();

router.use(authMiddleware);

router.get("/", acaoController.list);
router.post("/", acaoController.create);
router.put("/:id", acaoController.update);
router.delete("/:id", acaoController.remove);

module.exports = router;