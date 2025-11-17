const { sendNotificationToAll, sendNotificationToUser } = require("../services/notificationServices");

/**
 * Enviar notificação para todos os usuários
 */
async function sendNotification(req, res) {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ ok: false, msg: "Título e corpo são obrigatórios" });
    }

    const response = await sendNotificationToAll(title, body);
    res.json(response);
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}

/**
 * Enviar notificação para um usuário específico
 */
async function sendNotificationToSpecificUser(req, res) {
  try {
    const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ 
        ok: false, 
        msg: "userId, título e corpo são obrigatórios" 
      });
    }

    const response = await sendNotificationToUser(userId, title, body);
    res.json(response);
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}

module.exports = { 
  sendNotification,
  sendNotificationToSpecificUser
};

