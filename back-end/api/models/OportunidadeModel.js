const db = require('./db');

class OportunidadeModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM oportunidade');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM oportunidade WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(oportunidade) {
    const { cliente_id, cuidador_id, origem, status, valor_estimado, contratacao_id } = oportunidade;
    const result = await db.query(
      'INSERT INTO oportunidade (cliente_id, cuidador_id, origem, status, valor_estimado, contratacao_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [cliente_id, cuidador_id, origem, status, valor_estimado, contratacao_id]
    );
    return result.rows[0].id;
  }

  static async update(id, oportunidade) {
    const { origem, status, valor_estimado, contratacao_id } = oportunidade;
    const result = await db.query(
      'UPDATE oportunidade SET origem = $1, status = $2, valor_estimado = $3, contratacao_id = $4 , data_criacao = CURRENT_TIMESTAMP WHERE id = $5',
      [origem, status, valor_estimado, contratacao_id, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM oportunidade WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = OportunidadeModel;

