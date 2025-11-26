<<<<<<< HEAD
const supabase = require('./db');

class ConsultaModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('consulta')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('consulta')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class ConsultaModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM consulta');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM consulta WHERE id = $1', [id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(consulta) {
    const { contratar_id, cuidador_id, cliente_id, servico_tipo_id, descricao, data_inicio, data_fim, duracao_min, valor_total, status } = consulta;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('consulta')
      .insert({
        contratar_id,
        cuidador_id,
        cliente_id,
        servico_tipo_id,
        descricao,
        data_inicio,
        data_fim,
        duracao_min,
        valor_total,
        status
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
=======
    const result = await db.query(
      'INSERT INTO consulta (contratar_id, cuidador_id, cliente_id, servico_tipo_id, descricao, data_inicio, data_fim, duracao_min, valor_total, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [contratar_id, cuidador_id, cliente_id, servico_tipo_id, descricao, data_inicio, data_fim, duracao_min, valor_total, status]
    );
    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, consulta) {
    const { descricao, data_inicio, data_fim, duracao_min, valor_total, status } = consulta;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('consulta')
      .update({
        descricao,
        data_inicio,
        data_fim,
        duracao_min,
        valor_total,
        status,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('consulta')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE consulta SET descricao = $1, data_inicio = $2, data_fim = $3, duracao_min = $4, valor_total = $5, status = $6, atualizado_em = CURRENT_TIMESTAMP WHERE id = $7',
      [descricao, data_inicio, data_fim, duracao_min, valor_total, status, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM consulta WHERE id = $1', [id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = ConsultaModel;

