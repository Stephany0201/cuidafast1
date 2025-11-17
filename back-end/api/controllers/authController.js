const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const UsuarioModel = require('../models/UsuarioModel');
const TokenModel = require('../models/TokenModel');
const ClienteModel = require('../models/ClienteModel');
const CuidadorModel = require('../models/CuidadorModel');

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '30d';
const BCRYPT_ROUNDS = 10;

// JWT Secret único para simplificar
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || false;

function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}
function createRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
}

exports.registerValidators = [
  body('nome').isLength({ min: 2 }).withMessage('Nome curto'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha precisa de pelo menos 6 caracteres'),
];

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { nome, email, senha, telefone, data_nascimento, tipo } = req.body;
  
  // Validar tipo de usuário
  if (tipo && !['cliente', 'cuidador'].includes(tipo)) {
    return res.status(400).json({ message: 'Tipo de usuário inválido. Use "cliente" ou "cuidador"' });
  }

  try {
    const existing = await UsuarioModel.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email já cadastrado' });

    const hash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
    const userId = await UsuarioModel.create({
      nome,
      email,
      senha: hash,
      telefone: telefone || null,
      data_nascimento: data_nascimento || null,
    });

    // Criar registro na tabela específica (cliente ou cuidador)
    if (tipo === 'cliente') {
      await ClienteModel.create({
        usuario_id: userId,
        historico_contratacoes: null,
        endereco: null,
        preferencias: null
      });
    } else if (tipo === 'cuidador') {
      await CuidadorModel.create({
        usuario_id: userId,
        tipos_cuidado: null,
        descricao: null,
        valor_hora: null,
        especialidades: null,
        experiencia: null,
        avaliacao: null,
        horarios_disponiveis: null,
        idiomas: null,
        formacao: null,
        local_trabalho: null,
        ganhos: null
      });
    }

    const user = await UsuarioModel.getById(userId);
    // não enviar senha de volta
    delete user.senha;

    // Adicionar tipo ao retorno
    user.tipo = tipo || null;

    return res.status(201).json({ user });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await UsuarioModel.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(401).json({ message: 'Credenciais inválidas' });

    // tokens
    const payload = { id: user.id, email: user.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // salvar refresh token no DB
    await TokenModel.create(user.id, refreshToken);

    // atualizar ultimo_login
    await UsuarioModel.setLastLogin(user.id);

    // enviar cookie httpOnly para refresh; access token no body (ou também cookie, se preferir)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'Lax',
      domain: COOKIE_DOMAIN,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30d
    });

    // Remova senha antes de responder
    delete user.senha;
    return res.json({ accessToken, user });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token ausente' });

    // verificar se token existe no DB
    const tokenRow = await TokenModel.findByToken(token);
    if (!tokenRow) return res.status(401).json({ message: 'Refresh token inválido' });

    // verificar assinatura
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // token expirado ou inválido -> remover do DB
      await TokenModel.deleteByToken(token);
      return res.status(401).json({ message: 'Refresh token inválido ou expirado' });
    }

    // gerar novo access token (poderia também renovar refresh se quiser)
    const accessToken = createAccessToken({ id: payload.id, email: payload.email });
    return res.json({ accessToken });
  } catch (err) {
    console.error('refresh error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await TokenModel.deleteByToken(token);
    }
    // Limpar cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'Lax',
      domain: COOKIE_DOMAIN,
    });
    return res.json({ message: 'Deslogado' });
  } catch (err) {
    console.error('logout error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};


