<<<<<<< HEAD
const { auth } = require('../services/firebaseAdmin');
const UsuarioModel = require('../models/UsuarioModel');

// Login com Google via Firebase
exports.loginGoogle = async (req, res) => {
  try {
    const { token, tipo_usuario } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token do Firebase é obrigatório' });
    }

    // Verificar token do Firebase
    const decodedToken = await auth.verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // Buscar ou criar usuário no MariaDB
    let usuario = await UsuarioModel.findByFirebaseUid(uid);
    
    if (!usuario) {
      // Criar usuário simplificado no MariaDB
      const userId = await UsuarioModel.create({
        nome: name || email.split('@')[0],
        email: email,
        senha: null, // Firebase users não têm senha no MariaDB
        telefone: null,
        data_nascimento: null,
        firebase_uid: uid
      });
      
      usuario = await UsuarioModel.getById(userId);
    }

    // Atualizar último login
    await UsuarioModel.setLastLogin(usuario.id);

    // Remover senha da resposta
    delete usuario.senha;

    return res.json({
      message: 'Login realizado com sucesso',
      user: {
        ...usuario,
        tipo_usuario: tipo_usuario || 'cliente'
      }
    });

  } catch (error) {
    console.error('Erro no login Google:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Cadastro de usuário normal (usar authController.register em vez disso)
exports.cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, telefone, data_nascimento, tipo_usuario } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const existingUser = await UsuarioModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(senha, 10);

    // Criar usuário no MariaDB
    const userId = await UsuarioModel.create({
      nome,
      email,
      senha: hash,
      telefone: telefone || null,
      data_nascimento: data_nascimento || null
    });

    const usuario = await UsuarioModel.getById(userId);
    delete usuario.senha; // Não retornar senha

    return res.status(201).json({
      message: 'Cadastro realizado com sucesso',
      user: {
        ...usuario,
        tipo_usuario: tipo_usuario || 'cliente'
      }
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
=======
// Espera: POST { email, nome, foto_url, tipo_usuario }
// Retorna: 201 user criado / 200 user atualizado

import UsuarioModel from '../models/UsuarioModel.js';
import ClienteModel from '../models/ClienteModel.js';
import CuidadorModel from '../models/CuidadorModel.js';

export const loginGoogle = async (req, res) => {
  try {
    const { email, nome, foto_url, tipo_usuario } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'Email obrigatório' });
    }

    // valida tipo
    const tipo = tipo_usuario === 'cuidador' ? 'cuidador' : 'cliente';

    // busca por email
    let usuario = await UsuarioModel.findByEmail(email);

    if (!usuario) {
      // cria usuário simplificado no DB
      const userId = await UsuarioModel.create({
        nome: nome || email.split('@')[0],
        email,
        senha: null,
        telefone: null,
        data_nascimento: null,
        photo_url: foto_url || null,
        auth_uid: null,
        tipo
      });

      usuario = await UsuarioModel.getById(userId);

      // cria registros complementares conforme tipo
      if (tipo === 'cliente') {
        await ClienteModel.create({ usuario_id: userId });
      } else if (tipo === 'cuidador') {
        await CuidadorModel.create({ usuario_id: userId });
      }

      delete usuario.senha;
      return res.status(201).json({
        message: 'Usuário criado via Google',
        user: usuario
      });
    }

    // se já existe, atualiza possível foto/tipo
    await UsuarioModel.updateGoogleData(usuario.id, {
      photo_url: foto_url || usuario.photo_url,
      tipo
    });

    usuario = await UsuarioModel.getById(usuario.id);
    delete usuario.senha;

    // atualiza último login (se você tiver função)
    if (UsuarioModel.setLastLogin) {
      await UsuarioModel.setLastLogin(usuario.id);
    }

    return res.status(200).json({
      message: 'Usuário existente atualizado',
      user: usuario
    });

  } catch (err) {
    console.error('cadastroController.loginGoogle error', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export default {
  loginGoogle
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
};
