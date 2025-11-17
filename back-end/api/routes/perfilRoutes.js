const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');

// Buscar perfil público de cuidador
router.get('/cuidador/:id', perfilController.getPerfilCuidador);

// Buscar perfil público de cliente
router.get('/cliente/:id', perfilController.getPerfilCliente);

// Buscar perfil por email
router.get('/buscar', perfilController.buscarPerfilPorEmail);

// Listar todos os cuidadores
router.get('/cuidadores', perfilController.listarCuidadores);

// Atualizar foto de perfil
router.put('/foto', perfilController.atualizarFotoPerfil);

module.exports = router;