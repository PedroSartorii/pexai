const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const clientController = require("../controllers/clientController");

router.post("/", auth, clientController.createClient);
router.get("/", auth, clientController.listClients);
router.get("/:id", auth, clientController.getClient);
router.put("/:id", auth, clientController.updateClient);
router.delete("/:id", auth, clientController.deleteClient);

module.exports = router;
