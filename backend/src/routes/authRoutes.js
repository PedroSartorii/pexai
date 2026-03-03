const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { forgotPassword, resetPassword } = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

router.get("/teste", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;