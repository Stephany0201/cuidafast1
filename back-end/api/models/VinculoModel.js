const db = require('./db');

class VinculoModel {
  static async getCuidadorIdByClienteId(cliente_id) {
    const result = await db.query('SELECT cuidador_id FROM vinculos WHERE cliente_id = $1 LIMIT 1', [cliente_id]);
    return result.rows[0] ? result.rows[0].cuidador_id : null;
  }

  static async getClienteIdByCuidadorId(cuidador_id) {
    const result = await db.query('SELECT cliente_id FROM vinculos WHERE cuidador_id = $1 LIMIT 1', [cuidador_id]);
    return result.rows[0] ? result.rows[0].cliente_id : null;
  }

  static async create(cliente_id, cuidador_id) {
    await db.query('INSERT INTO vinculos (cliente_id, cuidador_id) VALUES ($1, $2)', [cliente_id, cuidador_id]);
    return true;
  }

  static async delete(cliente_id, cuidador_id) {
    const res = await db.query('DELETE FROM vinculos WHERE cliente_id = $1 AND cuidador_id = $2', [cliente_id, cuidador_id]);
    return res.rowCount > 0;
  }
}

module.exports = VinculoModel;
