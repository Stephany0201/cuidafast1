import authController from '../../back-end/api/controllers/authController.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parse do body se necessário (Vercel Serverless Functions)
  if (!req.body || typeof req.body === 'string') {
    try {
      const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => (data += chunk));
        req.on('end', () => {
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch (e) {
            reject(e);
          }
        });
        req.on('error', reject);
      });
      req.body = body;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  return authController.login(req, res);
}

