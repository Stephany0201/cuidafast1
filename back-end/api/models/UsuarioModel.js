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

<<<<<<< HEAD
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
=======
    // Campos e valores básicos
    const fields = ['nome', 'email', 'senha', 'telefone', 'data_nascimento'];
    const values = [nome, email, senha || null, telefone || null, data_nascimento || null];

    // Só adiciona firebase_uid se existir
    if (firebase_uid) {
      fields.push('firebase_uid');
      values.push(firebase_uid);
    }

    // Gera placeholders de forma dinâmica ($1, $2, $3...)
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

    // Query final
    const result = await db.query(
      `INSERT INTO usuario (${fields.join(', ')}, data_cadastro) VALUES (${placeholders}, NOW()) RETURNING id`,
      values
    );

    return result.rows[0].id;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
  }

  static async update(id, usuario) {
    const { nome, email, telefone, data_nascimento } = usuario;
<<<<<<< HEAD
    
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
=======
    const result = await db.query(
      'UPDATE usuario SET nome = $1, email = $2, telefone = $3, data_nascimento = $4, data_modificacao = CURRENT_TIMESTAMP WHERE id = $5',
      [nome, email, telefone, data_nascimento, id]
    );
    return result.rowCount;
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM usuario WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findByFirebaseUid(uid) {
    const result = await db.query('SELECT * FROM usuario WHERE firebase_uid = $1', [uid]);
    return result.rows[0];
  }

  static async setLastLogin(id) {
    const result = await db.query('UPDATE usuario SET ultimo_login = NOW() WHERE id = $1', [id]);
    return result.rowCount;
  }

  static async updatePassword(id, passwordHash) {
    const result = await db.query('UPDATE usuario SET senha = $1 WHERE id = $2', [passwordHash, id]);
    return result.rowCount;
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f
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

