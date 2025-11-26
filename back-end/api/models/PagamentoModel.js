<<<<<<< HEAD
const supabase = require('./db');

class PagamentoModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('pagamento')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('pagamento')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class PagamentoModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM pagamento');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM pagamento WHERE id = $1', [id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(pagamento) {
    const { consulta_id, contratar_id, cliente_id, cuidador_id, data_pagamento, valor, metodo_pagamento, status, referencia } = pagamento;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('pagamento')
      .insert({
        consulta_id,
        contratar_id,
        cliente_id,
        cuidador_id,
        data_pagamento,
        valor,
        metodo_pagamento,
        status,
        referencia
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
=======
    const result = await db.query(
      'INSERT INTO pagamento (consulta_id, contratar_id, cliente_id, cuidador_id, data_pagamento, valor, metodo_pagamento, status, referencia) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [consulta_id, contratar_id, cliente_id, cuidador_id, data_pagamento, valor, metodo_pagamento, status, referencia]
    );
    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, pagamento) {
    const { data_pagamento, valor, metodo_pagamento, status, referencia } = pagamento;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('pagamento')
      .update({
        data_pagamento,
        valor,
        metodo_pagamento,
        status,
        referencia,
        criado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('pagamento')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE pagamento SET data_pagamento = $1, valor = $2, metodo_pagamento = $3, status = $4, referencia = $5, criado_em = CURRENT_TIMESTAMP WHERE id = $6',
      [data_pagamento, valor, metodo_pagamento, status, referencia, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM pagamento WHERE id = $1', [id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = PagamentoModel;

