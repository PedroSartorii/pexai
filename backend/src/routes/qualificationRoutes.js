const { Router } = require("express");
const qualificationController = require("../controllers/qualificationController");
const authMiddleware = require("../middleware/auth");

const router = Router();

router.use(authMiddleware);

router.get("/", qualificationController.list);
router.post("/", qualificationController.create);
router.put("/:id", qualificationController.update);
router.delete("/:id", qualificationController.remove);

module.exports = router;