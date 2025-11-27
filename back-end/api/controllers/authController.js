import jwt from 'jsonwebtoken';
<<<<<<< HEAD
import bcrypt from 'bcrypt';
=======
import bcrypt from 'bcryptjs';
>>>>>>> 247f167439afad6341135e5638ae15851c75e252
import { createClient } from '@supabase/supabase-js';

import UsuarioModel from '../models/UsuarioModel.js';
import TokenModel from '../models/TokenModel.js';
import ClienteModel from '../models/ClienteModel.js';
import CuidadorModel from '../models/CuidadorModel.js';

/* ------------------------------------------
    CONFIG
-------------------------------------------*/
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '30d';
const BCRYPT_ROUNDS = 10;

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || false;

<<<<<<< HEAD
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
=======
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
>>>>>>> 247f167439afad6341135e5638ae15851c75e252

/* ------------------------------------------
    SUPABASE CLIENT
-------------------------------------------*/
<<<<<<< HEAD
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
=======
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
>>>>>>> 247f167439afad6341135e5638ae15851c75e252

/* ------------------------------------------
    HELPERS
-------------------------------------------*/
function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function createRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
}

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

/* ------------------------------------------
    REGISTER TRADICIONAL
-------------------------------------------*/
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
      tipo: tipo || null,
      photo_url: null,
      auth_uid: null
    });

    if (tipo === 'cliente') {
      await ClienteModel.create({ usuario_id: userId });
    }

    if (tipo === 'cuidador') {
      await CuidadorModel.create({ usuario_id: userId });
    }

    const user = await UsuarioModel.getById(userId);
    delete user.senha;

    return res.status(201).json({ user });

  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

/* ------------------------------------------
    LOGIN TRADICIONAL
-------------------------------------------*/
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    const user = await UsuarioModel.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(401).json({ message: 'Credenciais inválidas' });

    const payload = { id: user.id, email: user.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    await TokenModel.create(user.id, refreshToken);
    await UsuarioModel.setLastLogin(user.id);

    delete user.senha;

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({ accessToken, user });

  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

/* ------------------------------------------
    GOOGLE LOGIN (NOVO)
-------------------------------------------*/
export const googleLogin = async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
    const { email, nome, foto_url, tipo_usuario } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'Email obrigatório' });
    }

    if (!supabase) {
      return res.status(500).json({ message: 'Supabase não configurado' });
    }

    // Valida tipo
    const tipo = tipo_usuario === 'cuidador' ? 'cuidador' : 'cliente';
>>>>>>> 247f167439afad6341135e5638ae15851c75e252

    // Verifica se já existe no seu DB
    let user = await UsuarioModel.findByEmail(email);

    if (!user) {
      // cria usuário base
      const newId = await UsuarioModel.create({
<<<<<<< HEAD
        nome,
=======
        nome: nome || email.split('@')[0],
>>>>>>> 247f167439afad6341135e5638ae15851c75e252
        email,
        senha: null,
        telefone: null,
        data_nascimento: null,
<<<<<<< HEAD
        tipo: null,
        photo_url,
        auth_uid
      });

      user = await UsuarioModel.getById(newId);
    } else {
      // atualiza auth_uid + foto se mudou
      await UsuarioModel.updateGoogleData(user.id, auth_uid, photo_url);
=======
        tipo: tipo,
        photo_url: foto_url || null,
        auth_uid: null
      });

      user = await UsuarioModel.getById(newId);

      // cria registros complementares conforme tipo
      if (tipo === 'cliente') {
        await ClienteModel.create({ usuario_id: newId });
      } else if (tipo === 'cuidador') {
        await CuidadorModel.create({ usuario_id: newId });
      }
    } else {
      // atualiza foto se mudou
      if (foto_url) {
        await UsuarioModel.update(user.id, {
          nome: nome || user.nome,
          email: user.email,
          telefone: user.telefone,
          data_nascimento: user.data_nascimento
        });
        // Atualiza photo_url diretamente no banco se necessário
        // Por enquanto, apenas atualiza nome se fornecido
      }
>>>>>>> 247f167439afad6341135e5638ae15851c75e252
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

/* ------------------------------------------
    LOGOUT
-------------------------------------------*/
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await TokenModel.deleteByToken(token);
    }

    // limpa cookie
<<<<<<< HEAD
    setRefreshCookie(res, '');
    res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0;');
=======
    res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax;');
>>>>>>> 247f167439afad6341135e5638ae15851c75e252

    return res.status(200).json({ message: 'Deslogado' });

  } catch (err) {
    console.error('logout error', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

export default {
  register,
  login,
  googleLogin,
  refresh,
  logout
};
