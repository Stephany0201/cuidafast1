const { getConversas } = require('../../../back-end/api/controllers/mensagemController.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId é obrigatório' });
    }

    // Criar objeto req com params para o controller
    const reqWithParams = {
      ...req,
      params: { userId }
    };

    return await getConversas(reqWithParams, res);
  } catch (err) {
    console.error('[Mensagens] Erro ao buscar conversas:', err);
    return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
}

