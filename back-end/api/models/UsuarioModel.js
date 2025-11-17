const db = require('./db');

class UsuarioModel {
  static async getAll() {
    const result = await db.query('SELECT * FROM usuario');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM usuario WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(usuario) {
    const { nome, email, senha, telefone, data_nascimento, firebase_uid } = usuario;

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
  }

  static async update(id, usuario) {
    const { nome, email, telefone, data_nascimento } = usuario;
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

