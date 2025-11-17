const db = require('./db');

class ClienteModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM cliente');
    return result.rows;
  }

  static async getById(usuario_id) {
    const result = await db.query('SELECT * FROM cliente WHERE usuario_id = $1', [usuario_id]);
    return result.rows[0];
  }

  static async create(cliente) {
    const { usuario_id, historico_contratacoes, endereco, preferencias } = cliente;
    const result = await db.query(
      'INSERT INTO cliente (usuario_id, historico_contratacoes, endereco, preferencias) VALUES ($1, $2, $3, $4) RETURNING usuario_id',
      [usuario_id, historico_contratacoes, endereco, preferencias]
    );
    return result.rows[0].usuario_id;
  }

  static async update(usuario_id, cliente) {
    const { historico_contratacoes, endereco, preferencias } = cliente;
    const result = await db.query(
      'UPDATE cliente SET historico_contratacoes = $1, endereco = $2, preferencias = $3, data_modificacao = CURRENT_TIMESTAMP WHERE usuario_id = $4',
      [historico_contratacoes, endereco, preferencias, usuario_id]
    );
    return result.rowCount;
  }

  static async delete(usuario_id) {
    const result = await db.query('DELETE FROM cliente WHERE usuario_id = $1', [usuario_id]);
    return result.rowCount;
  }
}

module.exports = ClienteModel;

