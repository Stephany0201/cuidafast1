const db = require('./db');

class ServicoTipoModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM servico_tipo');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM servico_tipo WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(servico) {
    const { nome, descricao } = servico;
    const result = await db.query(
      'INSERT INTO servico_tipo (nome, descricao) VALUES ($1, $2) RETURNING id',
      [nome, descricao]
    );
    return result.rows[0].id;
  }

  static async update(id, servico) {
    const { nome, descricao } = servico;
    const result = await db.query(
      'UPDATE servico_tipo SET nome = $1, descricao = $2 WHERE id = $3',
      [nome, descricao, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM servico_tipo WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = ServicoTipoModel;

