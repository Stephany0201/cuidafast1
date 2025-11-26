import authController from '../back-end/api/controllers/authController.js';

export default async function handler(req, res) {
  const { method, url } = req;


  if (url.endsWith('/auth') && method === 'GET') {
    return res.status(200).json({ ok: true, rota: 'auth funcionando! kkk' });
  }

  if (url.endsWith('/auth/login') && method === 'POST') {
    return authController.login(req, res);
  }

  if (url.endsWith('/auth/logout') && method === 'POST') {
    return authController.logout(req, res);
  }

  if (url.endsWith('/auth/register') && method === 'POST') {
    return authController.register(req, res);
  }

  if (url.endsWith('/auth/refresh') && method === 'POST') {
    return authController.refresh(req, res);
  }

  return res.status(404).json({ error: 'Rota não encontrada' });
}
