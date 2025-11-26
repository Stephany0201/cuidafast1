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
  }

  static async create(cliente) {
    const { usuario_id, historico_contratacoes, endereco, preferencias } = cliente;
    
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
  }

  static async update(usuario_id, cliente) {
    const { historico_contratacoes, endereco, preferencias } = cliente;
    
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
  }
}

module.exports = ClienteModel;

