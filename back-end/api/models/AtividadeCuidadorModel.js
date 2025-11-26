<<<<<<< HEAD
const supabase = require('./db');

class AtividadeCuidadorModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('atividade_cuidador')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('atividade_cuidador')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class AtividadeCuidadorModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM atividade_cuidador');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM atividade_cuidador WHERE id = $1', [id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(atividade) {
    const { cuidador_id, tipo_atividade, referencia_id } = atividade;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('atividade_cuidador')
      .insert({
        cuidador_id,
        tipo_atividade,
        referencia_id
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
=======
    const result = await db.query(
      'INSERT INTO atividade_cuidador (cuidador_id, tipo_atividade, referencia_id) VALUES ($1, $2, $3) RETURNING id',
      [cuidador_id, tipo_atividade, referencia_id]
    );
    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, atividade) {
    const { tipo_atividade, referencia_id } = atividade;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('atividade_cuidador')
      .update({
        tipo_atividade,
        referencia_id,
        criado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('atividade_cuidador')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE atividade_cuidador SET tipo_atividade = $1, referencia_id = $2, criado_em = CURRENT_TIMESTAMP WHERE id = $3',
      [tipo_atividade, referencia_id, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM atividade_cuidador WHERE id = $1', [id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = AtividadeCuidadorModel;

