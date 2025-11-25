/*const { getMensagens } = require('../../../back-end/api/controllers/mensagemController.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { userId, contatoId } = req.query;
    
    if (!userId || !contatoId) {
      return res.status(400).json({ message: 'userId e contatoId são obrigatórios' });
    }

    // Criar objeto req com params para o controller
    const reqWithParams = {
      ...req,
      params: { userId, contatoId }
    };

    return await getMensagens(reqWithParams, res);
  } catch (err) {
    console.error('[Mensagens] Erro ao buscar mensagens:', err);
    return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
}
*/
