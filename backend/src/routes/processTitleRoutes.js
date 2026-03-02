const { Router } = require("express");
const processTitleController = require("../controllers/processTitleController");
const authMiddleware = require("../middleware/auth");

const router = Router();

router.use(authMiddleware);

router.get("/", processTitleController.list);
router.post("/", processTitleController.create);
router.put("/:id", processTitleController.update);
router.delete("/:id", processTitleController.remove);

module.exports = router;