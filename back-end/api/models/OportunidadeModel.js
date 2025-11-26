<<<<<<< HEAD
const supabase = require('./db');

class OportunidadeModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('oportunidade')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('oportunidade')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class OportunidadeModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM oportunidade');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM oportunidade WHERE id = $1', [id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(oportunidade) {
    const { cliente_id, cuidador_id, origem, status, valor_estimado, contratacao_id } = oportunidade;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('oportunidade')
      .insert({
        cliente_id,
        cuidador_id,
        origem,
        status,
        valor_estimado,
        contratacao_id
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
=======
    const result = await db.query(
      'INSERT INTO oportunidade (cliente_id, cuidador_id, origem, status, valor_estimado, contratacao_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [cliente_id, cuidador_id, origem, status, valor_estimado, contratacao_id]
    );
    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, oportunidade) {
    const { origem, status, valor_estimado, contratacao_id } = oportunidade;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('oportunidade')
      .update({
        origem,
        status,
        valor_estimado,
        contratacao_id,
        data_criacao: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('oportunidade')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE oportunidade SET origem = $1, status = $2, valor_estimado = $3, contratacao_id = $4 , data_criacao = CURRENT_TIMESTAMP WHERE id = $5',
      [origem, status, valor_estimado, contratacao_id, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM oportunidade WHERE id = $1', [id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = OportunidadeModel;

