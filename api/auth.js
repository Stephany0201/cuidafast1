import authController from '../back-end/api/controllers/authController.js';
import completeProfile from './authe/complete-profile.js';
import createOrAssociateUser from './create-or-associate-user.js';

export default async function handler(req, res) {
  const { method, url } = req;

  // -----------------------
  // HEALTH CHECK
  // -----------------------
  if (url.endsWith('/auth') && method === 'GET') {
    return res.status(200).json({ ok: true, rota: 'auth funcionando! kkk' });
  }

  // -----------------------
  // LOGIN / LOGOUT / REFRESH / GOOGLE LOGIN
  // -----------------------
  if (url.endsWith('/auth/login') && method === 'POST') {
    return authController.login(req, res);
  }

  if (url.endsWith('/auth/logout') && method === 'POST') {
    return authController.logout(req, res);
  }

  if (url.endsWith('/auth/refresh') && method === 'POST') {
    return authController.refresh(req, res);
  }

  if (url.endsWith('/auth/google-login') && method === 'POST') {
    return authController.googleLogin(req, res);
  }

  // -----------------------
  // REGISTER (cadastro tradicional)
  // -----------------------
  if (url.endsWith('/auth/register') && method === 'POST') {
    return authController.register(req, res);
  }

  // -----------------------
  // COMPLETE PROFILE (Supabase OAuth + dados complementares - Cliente e Cuidador)
  // -----------------------
  if (url.endsWith('/auth/complete-profile') && method === 'POST') {
    return completeProfile(req, res);
  }

  // -----------------------
  // COMPLETE CUIDADOR PROFILE (mantido para compatibilidade - redireciona para complete-profile)
  // -----------------------
  if (url.endsWith('/auth/complete-cuidador-profile') && method === 'POST') {
    // Redireciona para complete-profile mantendo compatibilidade
    return completeProfile(req, res);
  }

  // -----------------------
  // CREATE OR ASSOCIATE USER (email confirmado via Supabase)
  // -----------------------
  if (url.endsWith('/auth/create-or-associate-user') && method === 'POST') {
    return createOrAssociateUser(req, res);
  }

  // DEFAULT
  return res.status(404).json({ error: 'Rota não encontrada' });
}