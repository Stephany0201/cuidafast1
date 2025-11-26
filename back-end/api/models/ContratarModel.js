<<<<<<< HEAD
const supabase = require('./db');

class ContratarModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('contratar')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('contratar')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class ContratarModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM contratar');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM contratar WHERE id = $1', [id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(contratar) {
    const { cliente_id, cuidador_id, tipo_contratacao, data_inicio, data_fim, status } = contratar;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('contratar')
      .insert({
        cliente_id,
        cuidador_id,
        tipo_contratacao,
        data_inicio,
        data_fim,
        status
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
=======
    const result = await db.query(
      'INSERT INTO contratar (cliente_id, cuidador_id, tipo_contratacao, data_inicio, data_fim, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [cliente_id, cuidador_id, tipo_contratacao, data_inicio, data_fim, status]
    );
    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, contratar) {
    const { tipo_contratacao, data_inicio, data_fim, status } = contratar;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('contratar')
      .update({
        tipo_contratacao,
        data_inicio,
        data_fim,
        status,
        data_modificacao: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('contratar')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE contratar SET tipo_contratacao = $1, data_inicio = $2, data_fim = $3, status = $4, data_modificacao = CURRENT_TIMESTAMP WHERE id = $5',
      [tipo_contratacao, data_inicio, data_fim, status, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM contratar WHERE id = $1', [id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = ContratarModel;

