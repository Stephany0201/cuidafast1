import { getPerfilCuidador } from '../../../back-end/api/controllers/perfilController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query; // pega o id da URL
    try {
      const perfil = await getPerfilCuidador(id);
      return res.status(200).json(perfil);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao buscar perfil do cuidador' });
    }
  }
  return res.status(405).json({ message: 'Método não permitido' });
}
