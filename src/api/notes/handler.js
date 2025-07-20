class NotesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  async postNoteHandler(request, h) {
    this._validator.validateNotePayload(request.payload);

    const { title = 'untitled', body, tags } = request.payload;

    const { id: userId } = request.auth.credentials;

    const noteId = await this._service.addNote({
      title, body, tags, owner: userId,
    });

    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId,
      },
    });

    response.code(201);
    return response;
  }

  async getNotesHandler(request, h) {
    const { id: userId } = request.auth.credentials;

    const { result: notes, fromCache } = await this._service.getNotes(userId);

    const response = h.response({
      status: 'success',
      data: {
        notes,
      },
    });

    if (fromCache) {
      response
        .header('X-DATA-SOURCE', 'cache');
    }

    return response;
  }

  async getNoteByIdHandler(request, h) {
    const { id } = request.params;

    const { id: userId } = request.auth.credentials;
    await this._service.verifyNoteAccess(id, userId);

    const note = await this._service.getNoteById(id);

    return h.response({
      status: 'success',
      data: {
        note,
      },
    });
  }

  async putNoteByIdHandler(request, h) {
    const { id } = request.params;

    const { id: userId } = request.auth.credentials;
    await this._service.verifyNoteAccess(id, userId);

    this._validator.validateNotePayload(request.payload);

    const { title, body, tags } = request.payload;

    await this._service.updateNoteById(id, { title, body, tags });

    return h.response({
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    });
  }

  async deleteNoteByIdHandler(request, h) {
    const { id } = request.params;

    const { id: userId } = request.auth.credentials;
    await this._service.verifyNoteOwner(id, userId);

    await this._service.deleteNoteById(id);

    return h.response({
      status: 'success',
      message: 'Catatan berhasil dihapus',
    });
  }
}

module.exports = { NotesHandler };
