const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');
const ClientError = require('../../exceptions/ClientError');

class NotesService {
  constructor(collabService) {
    this._pool = new Pool();
    this._collabService = collabService;
  }

  async addNote({
    title, body, tags, owner,
  }) {
    const id = nanoid(16);
    const createdAt = (new Date()).toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };

    const result = await this._pool.query(query);
    const resultId = result.rows[0].id;

    if (!resultId) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return resultId;
  }

  async getNotes(owner) {
    const query = {
      text: `
        SELECT n.* FROM notes n
        LEFT JOIN collaborations c ON c.note_id = n.id
        WHERE n.owner = $1 OR c.user_id = $1
        GROUP BY n.id
      `,
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapDBToModel);
  }

  async getNoteById(id) {
    const query = {
      text: 'SELECT * FROM notes where id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async updateNoteById(id, { title, body, tags }) {
    const updatedAt = (new Date()).toISOString();

    const query = {
      text: 'UPDATE notes SET (title, body, tags, updated_at) = ($1, $2, $3, $4) WHERE id = $5 RETURNING *',
      values: [title, body, tags, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Catatan tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async deleteNoteById(id) {
    const query = {
      text: 'DELETE FROM notes  WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus catatan. Catatan tidak ditemukan');
    }
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes where id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    const note = rows[0];

    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyNoteAccess(noteId, userId) {
    try {
      await this.verifyNoteOwner(noteId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collabService.verifyCollaborator(noteId, userId);
      } catch (collabError) {
        if (collabError instanceof ClientError) {
          throw error;
        }

        // rethrow the inner error if it is not ClientError (indicating system error)
        throw collabError;
      }
    }
  }
}

module.exports = { NotesService };
