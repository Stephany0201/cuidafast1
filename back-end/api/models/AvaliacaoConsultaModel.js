const db = require('./db');

class AvaliacaoConsultaModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM avaliacao_consulta');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM avaliacao_consulta WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(avaliacao) {
    const { consulta_id, cliente_id, cuidador_id, nota, comentario } = avaliacao;
    const result = await db.query(
      'INSERT INTO avaliacao_consulta (consulta_id, cliente_id, cuidador_id, nota, comentario) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [consulta_id, cliente_id, cuidador_id, nota, comentario]
    );
    return result.rows[0].id;
  }

  static async update(id, avaliacao) {
    const { nota, comentario } = avaliacao;
    const result = await db.query(
      'UPDATE avaliacao_consulta SET nota = $1, comentario = $2, criado_em = CURRENT_TIMESTAMP WHERE id = $3',
      [nota, comentario, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM avaliacao_consulta WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = AvaliacaoConsultaModel;

