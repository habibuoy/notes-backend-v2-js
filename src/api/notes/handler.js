const ClientError = require('../../exceptions/ClientError');

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

  postNoteHandler(request, h) {
    this._validator.validateNotePayload(request.payload);

    const { title = 'untitle', body, tags } = request.payload;

    const noteId = this._service.addNote({ title, body, tags });
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

  getNotesHandler() {
    const notes = this._service.getNotes();
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  getNoteByIdHandler(request, h) {
    const { id } = request.params;
    const note = this._service.getNoteById(id);

    return h.response({
      status: 'success',
      data: {
        note,
      },
    });
  }

  putNoteByIdHandler(request, h) {
    this._validator.validateNotePayload(request.payload);

    const { id } = request.params;
    const { title, body, tags } = request.payload;

    this._service.updateNoteById(id, { title, body, tags });

    return h.response({
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    });
  }

  deleteNoteByIdHandler(request, h) {
    const { id } = request.params;
    this._service.deleteNoteById(id);

    return h.response({
      status: 'success',
      message: 'Catatan berhasil dihapus',
    });
  }
}

module.exports = { NotesHandler };
