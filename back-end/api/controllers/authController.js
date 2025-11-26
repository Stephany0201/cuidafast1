import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

import UsuarioModel from '../models/UsuarioModel.js';
import TokenModel from '../models/TokenModel.js';
import ClienteModel from '../models/ClienteModel.js';
import CuidadorModel from '../models/CuidadorModel.js';

<<<<<<< HEAD
=======
/* ------------------------------------------
    CONFIG
-------------------------------------------*/
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '30d';
const BCRYPT_ROUNDS = 10;

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || false;

<<<<<<< HEAD
=======
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

/* ------------------------------------------
    SUPABASE CLIENT
-------------------------------------------*/
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ------------------------------------------
    HELPERS
-------------------------------------------*/
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function createRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
}

<<<<<<< HEAD
=======
function setRefreshCookie(res, token) {
  const cookie = [
    `refreshToken=${token}`,
    `HttpOnly`,
    `Path=/`,
    `SameSite=Lax`
  ];

  if (COOKIE_SECURE) cookie.push('Secure');
  if (COOKIE_DOMAIN) cookie.push(`Domain=${COOKIE_DOMAIN}`);

  res.setHeader('Set-Cookie', cookie.join('; '));
}

>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
function validateRegisterBody(data) {
  const errors = [];

  if (!data.nome || data.nome.length < 2) {
    errors.push({ msg: 'Nome curto', field: 'nome' });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push({ msg: 'Email inválido', field: 'email' });
  }

  if (!data.senha || data.senha.length < 6) {
    errors.push({ msg: 'Senha precisa de pelo menos 6 caracteres', field: 'senha' });
  }

  return errors;
}

<<<<<<< HEAD
=======
/* ------------------------------------------
    REGISTER TRADICIONAL
-------------------------------------------*/
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
export const register = async (req, res) => {
  try {
    const body = req.body || {};
    const { nome, email, senha, telefone, data_nascimento, tipo } = body;

    const errors = validateRegisterBody(body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (tipo && !['cliente', 'cuidador'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo de usuário inválido' });
    }

    const existing = await UsuarioModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const hash = await bcrypt.hash(senha, BCRYPT_ROUNDS);

    const userId = await UsuarioModel.create({
      nome,
      email,
      senha: hash,
      telefone: telefone || null,
      data_nascimento: data_nascimento || null,
<<<<<<< HEAD
    });

    if (tipo === 'cliente') {
      await ClienteModel.create({
        usuario_id: userId,
        historico_contratacoes: null,
        endereco: null,
        preferencias: null
      });
    }

    if (tipo === 'cuidador') {
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
=======
      tipo: tipo || null,
      photo_url: null,
      auth_uid: null
    });

    if (tipo === 'cliente') {
      await ClienteModel.create({ usuario_id: userId });
    }

    if (tipo === 'cuidador') {
      await CuidadorModel.create({ usuario_id: userId });
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
    }

    const user = await UsuarioModel.getById(userId);
    delete user.senha;

<<<<<<< HEAD
    user.tipo = tipo || null;

=======
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
    return res.status(201).json({ user });

  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

<<<<<<< HEAD
=======
/* ------------------------------------------
    LOGIN TRADICIONAL
-------------------------------------------*/
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    const user = await UsuarioModel.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(401).json({ message: 'Credenciais inválidas' });

    const payload = { id: user.id, email: user.email };
<<<<<<< HEAD

=======
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    await TokenModel.create(user.id, refreshToken);
    await UsuarioModel.setLastLogin(user.id);

    delete user.senha;

<<<<<<< HEAD
    const cookie = [
      `refreshToken=${refreshToken}`,
      `HttpOnly`,
      `Path=/`,
      `SameSite=Lax`
    ];

    if (COOKIE_SECURE) cookie.push('Secure');
    if (COOKIE_DOMAIN) cookie.push(`Domain=${COOKIE_DOMAIN}`);

    res.setHeader('Set-Cookie', cookie.join('; '));
=======
    setRefreshCookie(res, refreshToken);
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f

    return res.status(200).json({ accessToken, user });

  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

<<<<<<< HEAD
=======
/* ------------------------------------------
    GOOGLE LOGIN (NOVO)
-------------------------------------------*/
export const googleLogin = async (req, res) => {
  try {
    // O front vai mandar o session do Supabase
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: 'Token não enviado' });
    }

    // Recupera usuário logado no Supabase
    const { data, error } = await supabase.auth.getUser(access_token);

    if (error || !data?.user) {
      return res.status(401).json({ message: 'Falha ao validar token do Google' });
    }

    const supaUser = data.user;

    const email = supaUser.email;
    const nome = supaUser.user_metadata?.full_name || null;
    const photo_url = supaUser.user_metadata?.avatar_url || null;
    const auth_uid = supaUser.id;

    // Verifica se já existe no seu DB
    let user = await UsuarioModel.findByEmail(email);

    if (!user) {
      // cria usuário base
      const newId = await UsuarioModel.create({
        nome,
        email,
        senha: null,
        telefone: null,
        data_nascimento: null,
        tipo: null,
        photo_url,
        auth_uid
      });

      user = await UsuarioModel.getById(newId);
    } else {
      // atualiza auth_uid + foto se mudou
      await UsuarioModel.updateGoogleData(user.id, auth_uid, photo_url);
      user = await UsuarioModel.getById(user.id);
    }

    // JWT
    const payload = { id: user.id, email: user.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // salva refresh interno
    await TokenModel.create(user.id, refreshToken);
    await UsuarioModel.setLastLogin(user.id);

    delete user.senha;

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      accessToken,
      user,
      google: true
    });

  } catch (err) {
    console.error('googleLogin error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

/* ------------------------------------------
    REFRESH
-------------------------------------------*/
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token ausente' });

    const tokenRow = await TokenModel.findByToken(token);
    if (!tokenRow) return res.status(401).json({ message: 'Refresh token inválido' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      await TokenModel.deleteByToken(token);
      return res.status(401).json({ message: 'Refresh token inválido ou expirado' });
    }

    const accessToken = createAccessToken({
      id: payload.id,
      email: payload.email
    });

    return res.status(200).json({ accessToken });

  } catch (err) {
    console.error('refresh error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

<<<<<<< HEAD
=======
/* ------------------------------------------
    LOGOUT
-------------------------------------------*/
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await TokenModel.deleteByToken(token);
    }

<<<<<<< HEAD
    const cookie = [
      `refreshToken=`,
      `HttpOnly`,
      `Path=/`,
      `SameSite=Lax`,
      `Max-Age=0`
    ];

    if (COOKIE_SECURE) cookie.push('Secure');
    if (COOKIE_DOMAIN) cookie.push(`Domain=${COOKIE_DOMAIN}`);

    res.setHeader('Set-Cookie', cookie.join('; '));
=======
    // limpa cookie
    setRefreshCookie(res, '');
    res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0;');
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f

    return res.status(200).json({ message: 'Deslogado' });

  } catch (err) {
    console.error('logout error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};
<<<<<<< HEAD
=======

export default {
  register,
  login,
  googleLogin,
  refresh,
  logout
};
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
