import authController from '../back-end/api/controllers/authController.js';
import cadastroController from '../back-end/api/controllers/cadastroController.js';

export default async function handler(req, res) {
const { method, url } = req;

// Teste da rota
if (url.endsWith('/auth') && method === 'GET') {
return res.status(200).json({ ok: true, rota: 'auth funcionando! kkk' });
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