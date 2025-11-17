const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

router.post('/create', pagamentoController.criarPagamento);

module.exports = router;
