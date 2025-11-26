const supabase = require('./db');

class UsuarioModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('usuario')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data || null;
  }

  static async create(usuario) {
    const { nome, email, senha, telefone, data_nascimento, firebase_uid } = usuario;

    const insertData = {
      nome,
      email,
      senha: senha || null,
      telefone: telefone || null,
      data_nascimento: data_nascimento || null,
      data_cadastro: new Date().toISOString()
    };

    if (firebase_uid) {
      insertData.firebase_uid = firebase_uid;
    }

    const { data, error } = await supabase
      .from('usuario')
      .insert(insertData)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  static async update(id, usuario) {
    const { nome, email, telefone, data_nascimento } = usuario;
    
    const { data, error } = await supabase
      .from('usuario')
      .update({
        nome,
        email,
        telefone,
        data_nascimento,
        data_modificacao: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || null;
  }

  static async findByFirebaseUid(uid) {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('firebase_uid', uid)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  static async setLastLogin(id) {
    const { data, error } = await supabase
      .from('usuario')
      .update({ ultimo_login: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async updatePassword(id, passwordHash) {
    const { data, error } = await supabase
      .from('usuario')
      .update({ senha: passwordHash })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data.length : 0;
  }

  static async findOrCreateByFirebase(uid, email, nome) {
    let usuario = await this.findByFirebaseUid(uid);
    if (!usuario) {
      const insertId = await this.create({ nome, email, senha: null, telefone: null, data_nascimento: null, firebase_uid: uid });
      usuario = await this.getById(insertId);
    }
    return usuario;
  }
}

module.exports = UsuarioModel;

