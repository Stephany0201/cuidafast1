<<<<<<< HEAD
const supabase = require('./db');

class ClienteModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('cliente')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(usuario_id) {
    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('usuario_id', usuario_id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class ClienteModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM cliente');
    return result.rows;
  }

  static async getById(usuario_id) {
    const result = await db.query('SELECT * FROM cliente WHERE usuario_id = $1', [usuario_id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(cliente) {
    const { usuario_id, historico_contratacoes, endereco, preferencias } = cliente;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('cliente')
      .insert({
        usuario_id,
        historico_contratacoes,
        endereco,
        preferencias
      })
      .select('usuario_id')
      .single();

    if (error) throw error;
    return data.usuario_id;
=======
    const result = await db.query(
      'INSERT INTO cliente (usuario_id, historico_contratacoes, endereco, preferencias) VALUES ($1, $2, $3, $4) RETURNING usuario_id',
      [usuario_id, historico_contratacoes, endereco, preferencias]
    );
    return result.rows[0].usuario_id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(usuario_id, cliente) {
    const { historico_contratacoes, endereco, preferencias } = cliente;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('cliente')
      .update({
        historico_contratacoes,
        endereco,
        preferencias,
        data_modificacao: new Date().toISOString()
      })
      .eq('usuario_id', usuario_id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(usuario_id) {
    const { data, error } = await supabase
      .from('cliente')
      .delete()
      .eq('usuario_id', usuario_id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE cliente SET historico_contratacoes = $1, endereco = $2, preferencias = $3, data_modificacao = CURRENT_TIMESTAMP WHERE usuario_id = $4',
      [historico_contratacoes, endereco, preferencias, usuario_id]
    );
    return result.rowCount;
  }

  static async delete(usuario_id) {
    const result = await db.query('DELETE FROM cliente WHERE usuario_id = $1', [usuario_id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = ClienteModel;

