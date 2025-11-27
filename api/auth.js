import authController from '../back-end/api/controllers/authController.js';
import cadastroController from '../back-end/api/controllers/cadastroController.js';

export default async function handler(req, res) {
const { method, url } = req;

<<<<<<< HEAD
<<<<<<< HEAD
  // Teste da rota
=======
  // -----------------------
  // HEALTH CHECK
  // -----------------------
>>>>>>> 247f167439afad6341135e5638ae15851c75e252
  if (url.endsWith('/auth') && method === 'GET') {
    return res.status(200).json({ ok: true, rota: 'auth funcionando! kkk' });
  }

<<<<<<< HEAD
  // LOGIN
  if (url.endsWith('/auth/login') && method === 'POST') {
    return authController.login(req, res);
  }

  // LOGOUT
  if (url.endsWith('/auth/logout') && method === 'POST') {
    return authController.logout(req, res);
  }

  // REGISTER
  if (url.endsWith('/auth/register') && method === 'POST') {
    return authController.register(req, res);
  }

  // REFRESH TOKEN
  if (url.endsWith('/auth/refresh') && method === 'POST') {
    return authController.refresh(req, res);
  }
//google
  if (url.endsWith('/auth/google-login') && method === 'POST')
    return authController.googleLogin(req, res);

=======
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
  // REGISTER
  // -----------------------
  if (url.endsWith('/auth/register') && method === 'POST') {
    return cadastroController.register(req, res);
  }

  // -----------------------
  // COMPLETE PROFILE (from complete-profile.js)
  // -----------------------
  if (url.endsWith('/auth/complete-profile') && method === 'POST') {
    return completeProfile(req, res);
  }

  // -----------------------
  // CREATE OR ASSOCIATE USER (from create-or-associate-user.js)
  // -----------------------
  if (url.endsWith('/auth/create-or-associate-user') && method === 'POST') {
    return createOrAssociateUser(req, res);
  }

>>>>>>> 247f167439afad6341135e5638ae15851c75e252
  // DEFAULT
  return res.status(404).json({ error: 'Rota não encontrada' });
=======
// Teste da rota
if (url.endsWith('/auth') && method === 'GET') {
return res.status(200).json({ ok: true, rota: 'auth funcionando! kkk' });
>>>>>>> c8b7b405fc26ff8a1dbd88ca0bb75771bb343aac
}

// LOGIN
if (url.endsWith('/auth/login') && method === 'POST') {
return authController.login(req, res);
}

// LOGOUT
if (url.endsWith('/auth/logout') && method === 'POST') {
return authController.logout(req, res);
}

// REGISTER
if (url.endsWith('/auth/register') && method === 'POST') {
return cadastroController.register(req, res);
}

// REFRESH TOKEN
if (url.endsWith('/auth/refresh') && method === 'POST') {
return authController.refresh(req, res);
}
//google
if (url.endsWith('/auth/google-login') && method === 'POST')
return authController.googleLogin(req, res);

// DEFAULT
return res.status(404).json({ error: 'Rota não encontrada' });
}