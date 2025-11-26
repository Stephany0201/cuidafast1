const db = require('./db');

class PagamentoModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM pagamento');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM pagamento WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(pagamento) {
    const { consulta_id, contratar_id, cliente_id, cuidador_id, data_pagamento, valor, metodo_pagamento, status, referencia } = pagamento;
    const result = await db.query(
      'INSERT INTO pagamento (consulta_id, contratar_id, cliente_id, cuidador_id, data_pagamento, valor, metodo_pagamento, status, referencia) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [consulta_id, contratar_id, cliente_id, cuidador_id, data_pagamento, valor, metodo_pagamento, status, referencia]
    );
    return result.rows[0].id;
  }

  static async update(id, pagamento) {
    const { data_pagamento, valor, metodo_pagamento, status, referencia } = pagamento;
    const result = await db.query(
      'UPDATE pagamento SET data_pagamento = $1, valor = $2, metodo_pagamento = $3, status = $4, referencia = $5, criado_em = CURRENT_TIMESTAMP WHERE id = $6',
      [data_pagamento, valor, metodo_pagamento, status, referencia, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM pagamento WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = PagamentoModel;

