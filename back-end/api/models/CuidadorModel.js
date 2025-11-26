const supabase = require('./db');

class CuidadorModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('cuidador')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(usuario_id) {
    const { data, error } = await supabase
      .from('cuidador')
      .select('*')
      .eq('usuario_id', usuario_id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async create(cuidador) {
    const { usuario_id, tipos_cuidado, descricao, valor_hora, especialidades, experiencia, avaliacao, horarios_disponiveis, idiomas, formacao, local_trabalho, ganhos } = cuidador;
    
    const { data, error } = await supabase
      .from('cuidador')
      .insert({
        usuario_id,
        tipos_cuidado,
        descricao,
        valor_hora,
        especialidades,
        experiencia,
        avaliacao,
        horarios_disponiveis,
        idiomas,
        formacao,
        local_trabalho,
        ganhos
      })
      .select('usuario_id')
      .single();

    if (error) throw error;
    return data.usuario_id;
  }

  static async update(usuario_id, cuidador) {
    const { tipos_cuidado, descricao, valor_hora, especialidades, experiencia, avaliacao, horarios_disponiveis, idiomas, formacao, local_trabalho, ganhos } = cuidador;
    
    const { data, error } = await supabase
      .from('cuidador')
      .update({
        tipos_cuidado,
        descricao,
        valor_hora,
        especialidades,
        experiencia,
        avaliacao,
        horarios_disponiveis,
        idiomas,
        formacao,
        local_trabalho,
        ganhos
      })
      .eq('usuario_id', usuario_id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async delete(usuario_id) {
    const { data, error } = await supabase
      .from('cuidador')
      .delete()
      .eq('usuario_id', usuario_id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }
}

module.exports = CuidadorModel;

