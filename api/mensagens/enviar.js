const { enviarMensagem } = require('../../back-end/api/controllers/mensagemController.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Ler body da requisição
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data || '{}'));
        } catch (err) {
          reject(err);
        }
      });
      req.on('error', reject);
    });

    // Criar objeto req com body para o controller
    const reqWithBody = {
      ...req,
      body
    };

    return await enviarMensagem(reqWithBody, res);
  } catch (err) {
    console.error('[Mensagens] Erro ao enviar mensagem:', err);
    return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
}

