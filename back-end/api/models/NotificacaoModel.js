<<<<<<< HEAD
const supabase = require('./db');

class NotificacaoModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('notificacao')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('notificacao')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class NotificacaoModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM notificacao');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM notificacao WHERE id = $1', [id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(notificacao) {
    const { usuario_id, titulo, mensagem, status_leitura } = notificacao;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('notificacao')
      .insert({
        usuario_id,
        titulo,
        mensagem,
        status_leitura
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
=======
    const result = await db.query(
      'INSERT INTO notificacao (usuario_id, titulo, mensagem, status_leitura) VALUES ($1, $2, $3, $4) RETURNING id',
      [usuario_id, titulo, mensagem, status_leitura]
    );
    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, notificacao) {
    const { titulo, mensagem, status_leitura } = notificacao;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('notificacao')
      .update({
        titulo,
        mensagem,
        status_leitura,
        data_modificacao: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('notificacao')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE notificacao SET titulo = $1, mensagem = $2, status_leitura = $3, data_modificacao = CURRENT_TIMESTAMP WHERE id = $4',
      [titulo, mensagem, status_leitura, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM notificacao WHERE id = $1', [id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = NotificacaoModel;

