const express = require("express");
const router = express.Router();
const { sendNotification } = require("../controllers/notificationController");

// POST /notificacoes/enviar
router.post("/enviar", sendNotification);

module.exports = router;
