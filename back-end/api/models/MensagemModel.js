<<<<<<< HEAD
const supabase = require('./db');

class MensagemModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('mensagem')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('mensagem')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class MensagemModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM mensagem');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM mensagem WHERE id = $1', [id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(mensagem) {
    const { remetente_id, destinatario_id, conteudo } = mensagem;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('mensagem')
      .insert({
        remetente_id,
        destinatario_id,
        conteudo
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
=======
    const result = await db.query(
      'INSERT INTO mensagem (remetente_id, destinatario_id, conteudo) VALUES ($1, $2, $3) RETURNING id',
      [remetente_id, destinatario_id, conteudo]
    );
    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, mensagem) {
    const { conteudo } = mensagem;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('mensagem')
      .update({
        conteudo,
        data_modificacao: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('mensagem')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE mensagem SET conteudo = $1, data_modificacao = CURRENT_TIMESTAMP WHERE id = $2',
      [conteudo, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM mensagem WHERE id = $1', [id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = MensagemModel;

