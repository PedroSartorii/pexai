const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const auth    = require("../middleware/auth");
const ctrl    = require("../controllers/tipoMinutaController");

// ── Configuração do Multer ────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../../uploads/minutas");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Apenas PDF e DOCX são permitidos."));
  },
});

// ── Rotas ─────────────────────────────────────────────────────────────────────
router.get("/",                    auth, ctrl.list);
router.get("/:id",                 auth, ctrl.getOne);
router.post("/",                   auth, upload.single("modelo"), ctrl.create);
router.put("/:id",                 auth, upload.single("modelo"), ctrl.update);
router.delete("/:id",              auth, ctrl.remove);
router.get("/:id/modelo",          auth, ctrl.downloadModelo);

module.exports = router;