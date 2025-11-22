import { buscarPerfilPorEmail } from '../../back-end/api/controllers/perfilController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { email } = req.query;
    try {
      const perfil = await buscarPerfilPorEmail(email);
      return res.status(200).json(perfil);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
  }
  return res.status(405).json({ message: 'Método não permitido' });
}
