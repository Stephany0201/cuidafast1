const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Salvar dados complementares do cliente (endereço, CPF, etc)
router.post('/dados-complementares', clienteController.salvarDadosComplementares);

module.exports = router;