// /api/auth.js
import { json } from 'micro';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { supabase } from '../back-end/api/dbSupabase';
import UsuarioModel from '../back-end/api/models/UsuarioModel';
import TokenModel from '../back-end/api/models/TokenModel';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '30d';
const BCRYPT_ROUNDS = 10;

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || false;
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function createRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export default async function handler(req, res) {
  // CORS básico
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.end();

  const url = req.url.split('?')[0];

  // Rota de teste
  if (req.method === 'GET' && url === '/') {
    return res.status(200).json({ ok: true, rota: 'auth funcionando!' });
  }

  // Registro
  if (req.method === 'POST' && url.endsWith('/register')) {
    const body = await json(req);
    const { nome, email, senha, telefone, data_nascimento, tipo } = body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }
    if (tipo && !['cliente', 'cuidador'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo de usuário inválido. Use "cliente" ou "cuidador"' });
    }

    try {
      const existing = await UsuarioModel.findByEmail(email);
      if (existing) return res.status(409).json({ message: 'Email já cadastrado' });

      const hash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
      const userId = await UsuarioModel.create({
        nome, email, senha: hash, telefone: telefone || null, data_nascimento: data_nascimento || null
      });

      if (tipo === 'cliente') {
        await UsuarioModel.createCliente(userId);
      } else if (tipo === 'cuidador') {
        await UsuarioModel.createCuidador(userId);
      }

      const user = await UsuarioModel.getById(userId);
      delete user.senha;
      user.tipo = tipo || null;

      return res.status(201).json({ user });
    } catch (err) {
      console.error('register error', err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
  }

  // Login
  if (req.method === 'POST' && url.endsWith('/login')) {
    const body = await json(req);
    const { email, senha } = body;

    try {
      const user = await UsuarioModel.findByEmail(email);
      if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

      const match = await bcrypt.compare(senha, user.senha);
      if (!match) return res.status(401).json({ message: 'Credenciais inválidas' });

      const payload = { id: user.id, email: user.email };
      const accessToken = createAccessToken(payload);
      const refreshToken = createRefreshToken(payload);

      await TokenModel.create(user.id, refreshToken);
      await UsuarioModel.setLastLogin(user.id);

      res.setHeader('Set-Cookie', cookie.serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: 'Lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        domain: COOKIE_DOMAIN,
      }));

      delete user.senha;
      return res.status(200).json({ accessToken, user });
    } catch (err) {
      console.error('login error', err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
  }

  // Refresh token
  if (req.method === 'POST' && url.endsWith('/refresh')) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token ausente' });

    try {
      const tokenRow = await TokenModel.findByToken(token);
      if (!tokenRow) return res.status(401).json({ message: 'Refresh token inválido' });

      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        await TokenModel.deleteByToken(token);
        return res.status(401).json({ message: 'Refresh token inválido ou expirado' });
      }

      const accessToken = createAccessToken({ id: payload.id, email: payload.email });
      return res.status(200).json({ accessToken });
    } catch (err) {
      console.error('refresh error', err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }
  }

  // Logout
  if (req.method === 'POST' && url.endsWith('/logout')) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.refreshToken;
    if (token) await TokenModel.deleteByToken(token);

    res.setHeader('Set-Cookie', cookie.serialize('refreshToken', '', {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'Lax',
      maxAge: 0,
      path: '/',
      domain: COOKIE_DOMAIN,
    }));
    return res.status(200).json({ message: 'Deslogado' });
  }

  return res.status(404).json({ error: 'Rota não encontrada' });
}
