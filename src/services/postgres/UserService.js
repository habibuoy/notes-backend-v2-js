const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UserService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUserName(username);

    const id = `user-${nanoid(16)}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4) RETURNING *',
      values: [id, username, hashedPassword, fullname],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return rows[0];
  }

  async verifyNewUserName(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan');
    }
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return rows[0];
  }

  async getUsers({ username }) {
    const query = {
      text: 'SELECT * FROM users WHERE username LIKE $1',
      values: [`%${username}%`],
    };

    const { rows } = await this._pool.query(query);

    return rows.map((u) => ({ id: u.id, username: u.username, fullname: u.fullname }));
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = rows[0];

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }
}

module.exports = { UserService };
