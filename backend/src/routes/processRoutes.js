const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createProcess, listProcesses, downloadDocx } = require("../controllers/processController");

router.post("/", auth, createProcess);
router.get("/", auth, listProcesses);
router.get("/:id/docx", auth, downloadDocx);

module.exports = router;