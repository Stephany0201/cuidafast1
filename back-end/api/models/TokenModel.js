const db = require('./db');

class TokenModel {
  static async create(userId, token) {
    const result = await db.query(
      'INSERT INTO tokens (user_id, token) VALUES ($1, $2) RETURNING id',
      [userId, token]
    );
    return result.rows[0].id;
  }

  static async findByToken(token) {
    const result = await db.query('SELECT * FROM tokens WHERE token = $1', [token]);
    return result.rows[0];
  }

  static async deleteByToken(token) {
    const result = await db.query('DELETE FROM tokens WHERE token = $1', [token]);
    return result.rowCount;
  }

  static async deleteAllForUser(userId) {
    const result = await db.query('DELETE FROM tokens WHERE user_id = $1', [userId]);
    return result.rowCount;
  }
}

module.exports = TokenModel;

