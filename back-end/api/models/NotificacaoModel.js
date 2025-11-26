const db = require('./db');

class NotificacaoModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM notificacao');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM notificacao WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(notificacao) {
    const { usuario_id, titulo, mensagem, status_leitura } = notificacao;
    const result = await db.query(
      'INSERT INTO notificacao (usuario_id, titulo, mensagem, status_leitura) VALUES ($1, $2, $3, $4) RETURNING id',
      [usuario_id, titulo, mensagem, status_leitura]
    );
    return result.rows[0].id;
  }

  static async update(id, notificacao) {
    const { titulo, mensagem, status_leitura } = notificacao;
    const result = await db.query(
      'UPDATE notificacao SET titulo = $1, mensagem = $2, status_leitura = $3, data_modificacao = CURRENT_TIMESTAMP WHERE id = $4',
      [titulo, mensagem, status_leitura, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM notificacao WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = NotificacaoModel;

