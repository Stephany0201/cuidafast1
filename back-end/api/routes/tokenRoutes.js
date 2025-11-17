const express = require('express');
const router = express.Router();

// Placeholder para gerenciamento de tokens (futuro)
router.get('/', (req, res) => {
  res.json({ message: 'Rota de tokens - em desenvolvimento' });
});

module.exports = router;