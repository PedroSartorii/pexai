const { Router } = require("express");
const juizoController = require("../controllers/juizoController");
const authMiddleware = require("../middleware/auth");

const router = Router();

router.use(authMiddleware);

router.get("/", juizoController.list);
router.post("/", juizoController.create);
router.put("/:id", juizoController.update);
router.delete("/:id", juizoController.remove);

module.exports = router;