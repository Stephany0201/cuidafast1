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
};
