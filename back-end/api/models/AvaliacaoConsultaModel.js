<<<<<<< HEAD
const supabase = require('./db');

class AvaliacaoConsultaModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('avaliacao_consulta')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('avaliacao_consulta')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
=======
const db = require('./db');

class AvaliacaoConsultaModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM avaliacao_consulta');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM avaliacao_consulta WHERE id = $1', [id]);
    return result.rows[0];
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async create(avaliacao) {
    const { consulta_id, cliente_id, cuidador_id, nota, comentario } = avaliacao;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('avaliacao_consulta')
      .insert({
        consulta_id,
        cliente_id,
        cuidador_id,
        nota,
        comentario
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
=======
    const result = await db.query(
      'INSERT INTO avaliacao_consulta (consulta_id, cliente_id, cuidador_id, nota, comentario) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [consulta_id, cliente_id, cuidador_id, nota, comentario]
    );
    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, avaliacao) {
    const { nota, comentario } = avaliacao;
<<<<<<< HEAD
    
    const { data, error } = await supabase
      .from('avaliacao_consulta')
      .update({
        nota,
        comentario,
        criado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('avaliacao_consulta')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
=======
    const result = await db.query(
      'UPDATE avaliacao_consulta SET nota = $1, comentario = $2, criado_em = CURRENT_TIMESTAMP WHERE id = $3',
      [nota, comentario, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM avaliacao_consulta WHERE id = $1', [id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }
}

module.exports = AvaliacaoConsultaModel;

