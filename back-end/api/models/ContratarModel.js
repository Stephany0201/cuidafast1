const db = require('./db');

class ContratarModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM contratar');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM contratar WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(contratar) {
    const { cliente_id, cuidador_id, tipo_contratacao, data_inicio, data_fim, status } = contratar;
    const result = await db.query(
      'INSERT INTO contratar (cliente_id, cuidador_id, tipo_contratacao, data_inicio, data_fim, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [cliente_id, cuidador_id, tipo_contratacao, data_inicio, data_fim, status]
    );
    return result.rows[0].id;
  }

  static async update(id, contratar) {
    const { tipo_contratacao, data_inicio, data_fim, status } = contratar;
    const result = await db.query(
      'UPDATE contratar SET tipo_contratacao = $1, data_inicio = $2, data_fim = $3, status = $4, data_modificacao = CURRENT_TIMESTAMP WHERE id = $5',
      [tipo_contratacao, data_inicio, data_fim, status, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM contratar WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = ContratarModel;

