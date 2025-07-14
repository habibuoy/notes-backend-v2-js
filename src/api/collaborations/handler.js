class CollaborationsHandler {
  constructor(collabService, notesService, validator) {
    this._service = collabService;
    this._notesService = notesService;
    this._validator = validator;
  }

  async postCollaborationHandler(request, h) {
    this._validator.validatePostCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { noteId, userId } = request.payload;

    await this._notesService.verifyNoteOwner(noteId, credentialId);

    const result = await this._service.addCollaboration(noteId, userId);

    return h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId: result,
      },
    }).code(201);
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateDeleteCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { noteId, userId } = request.payload;

    await this._notesService.verifyNoteOwner(noteId, credentialId);

    await this._service.deleteCollaboration(noteId, userId);

    return h.response({
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    });
  }
}

module.exports = { CollaborationsHandler };
