const express = require('express');
const router = express.Router();

// Placeholder para funcionalidade de mensagens (futuro)
router.get('/', (req, res) => {
  res.json({ message: 'Rota de mensagens - em desenvolvimento' });
});

module.exports = router;