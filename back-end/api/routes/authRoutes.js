// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de teste — só pra confirmar que o módulo está ativo
router.get('/', (req, res) => {
  res.json({ ok: true, rota: 'auth funcionando!' });
});

// Registro de novo usuário
router.post('/register', authController.registerValidators, authController.register);

// Login — retorna token + redirecionamento
router.post('/login', authController.login);

// Refresh token — renova o token de acesso
router.post('/refresh', authController.refresh);

// Logout — limpa cookie e token do banco
router.post('/logout', authController.logout);

module.exports = router;

