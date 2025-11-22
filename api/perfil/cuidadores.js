import { listarCuidadores } from '../../back-end/api/controllers/perfilController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const cuidadores = await listarCuidadores();
      return res.status(200).json(cuidadores);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao listar cuidadores' });
    }
  }
  return res.status(405).json({ message: 'Método não permitido' });
}
