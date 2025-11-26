<<<<<<< HEAD
const supabase = require('./db');

class ServicoTipoModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('servico_tipo')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('servico_tipo')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class ServicoTipoModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM servico_tipo');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM servico_tipo WHERE id = $1', [id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(servico) {
    const { nome, descricao } = servico;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('servico_tipo')
      .insert({
        nome,
        descricao
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
=======
    const result = await db.query(
      'INSERT INTO servico_tipo (nome, descricao) VALUES ($1, $2) RETURNING id',
      [nome, descricao]
    );
    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, servico) {
    const { nome, descricao } = servico;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('servico_tipo')
      .update({
        nome,
        descricao
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('servico_tipo')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE servico_tipo SET nome = $1, descricao = $2 WHERE id = $3',
      [nome, descricao, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM servico_tipo WHERE id = $1', [id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = ServicoTipoModel;

