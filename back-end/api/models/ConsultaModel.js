const db = require('./db');

class ConsultaModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM consulta');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM consulta WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(consulta) {
    const { contratar_id, cuidador_id, cliente_id, servico_tipo_id, descricao, data_inicio, data_fim, duracao_min, valor_total, status } = consulta;
    const result = await db.query(
      'INSERT INTO consulta (contratar_id, cuidador_id, cliente_id, servico_tipo_id, descricao, data_inicio, data_fim, duracao_min, valor_total, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [contratar_id, cuidador_id, cliente_id, servico_tipo_id, descricao, data_inicio, data_fim, duracao_min, valor_total, status]
    );
    return result.rows[0].id;
  }

  static async update(id, consulta) {
    const { descricao, data_inicio, data_fim, duracao_min, valor_total, status } = consulta;
    const result = await db.query(
      'UPDATE consulta SET descricao = $1, data_inicio = $2, data_fim = $3, duracao_min = $4, valor_total = $5, status = $6, atualizado_em = CURRENT_TIMESTAMP WHERE id = $7',
      [descricao, data_inicio, data_fim, duracao_min, valor_total, status, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM consulta WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = ConsultaModel;

