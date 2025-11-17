const db = require('./db');

class CuidadorModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM cuidador');
    return result.rows;
  }

  static async getById(usuario_id) {
    const result = await db.query('SELECT * FROM cuidador WHERE usuario_id = $1', [usuario_id]);
    return result.rows[0];
  }

  static async create(cuidador) {
    const { usuario_id, tipos_cuidado, descricao, valor_hora, especialidades, experiencia, avaliacao, horarios_disponiveis, idiomas, formacao, local_trabalho, ganhos } = cuidador;
    const result = await db.query(
      'INSERT INTO cuidador (usuario_id, tipos_cuidado, descricao, valor_hora, especialidades, experiencia, avaliacao, horarios_disponiveis, idiomas, formacao, local_trabalho, ganhos) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING usuario_id',
      [usuario_id, tipos_cuidado, descricao, valor_hora, especialidades, experiencia, avaliacao, horarios_disponiveis, idiomas, formacao, local_trabalho, ganhos]
    );
    return result.rows[0].usuario_id;
  }

  static async update(usuario_id, cuidador) {
    const { tipos_cuidado, descricao, valor_hora, especialidades, experiencia, avaliacao, horarios_disponiveis, idiomas, formacao, local_trabalho, ganhos } = cuidador;
    const result = await db.query(
      `UPDATE cuidador SET tipos_cuidado = $1, descricao = $2, valor_hora = $3, especialidades = $4, experiencia = $5, avaliacao = $6, horarios_disponiveis = $7, idiomas = $8, formacao = $9, local_trabalho = $10, ganhos = $11 WHERE usuario_id = $12`,
      [tipos_cuidado, descricao, valor_hora, especialidades, experiencia, avaliacao, horarios_disponiveis, idiomas, formacao, local_trabalho, ganhos, usuario_id]
    );
    return result.rowCount;
  }

  static async delete(usuario_id) {
    const result = await db.query('DELETE FROM cuidador WHERE usuario_id = $1', [usuario_id]);
    return result.rowCount;
  }
}

module.exports = CuidadorModel;

