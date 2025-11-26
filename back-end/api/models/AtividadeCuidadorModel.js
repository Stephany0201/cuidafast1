const db = require('./db');

class AtividadeCuidadorModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM atividade_cuidador');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM atividade_cuidador WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(atividade) {
    const { cuidador_id, tipo_atividade, referencia_id } = atividade;
    const result = await db.query(
      'INSERT INTO atividade_cuidador (cuidador_id, tipo_atividade, referencia_id) VALUES ($1, $2, $3) RETURNING id',
      [cuidador_id, tipo_atividade, referencia_id]
    );
    return result.rows[0].id;
  }

  static async update(id, atividade) {
    const { tipo_atividade, referencia_id } = atividade;
    const result = await db.query(
      'UPDATE atividade_cuidador SET tipo_atividade = $1, referencia_id = $2, criado_em = CURRENT_TIMESTAMP WHERE id = $3',
      [tipo_atividade, referencia_id, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM atividade_cuidador WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = AtividadeCuidadorModel;

