const db = require('./db');

class MensagemModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM mensagem');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM mensagem WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(mensagem) {
    const { remetente_id, destinatario_id, conteudo } = mensagem;
    const result = await db.query(
      'INSERT INTO mensagem (remetente_id, destinatario_id, conteudo) VALUES ($1, $2, $3) RETURNING id',
      [remetente_id, destinatario_id, conteudo]
    );
    return result.rows[0].id;
  }

  static async update(id, mensagem) {
    const { conteudo } = mensagem;
    const result = await db.query(
      'UPDATE mensagem SET conteudo = $1, data_modificacao = CURRENT_TIMESTAMP WHERE id = $2',
      [conteudo, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM mensagem WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = MensagemModel;

