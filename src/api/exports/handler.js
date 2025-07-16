const { MessageQueueName } = require('../../services/NotesMessaging');

class ExportHandler {
  constructor(producerService, exportValidator) {
    this._service = producerService;
    this._validator = exportValidator;
  }

  async postExportNotesHanlder(request, h) {
    this._validator.validateExportNotesPayload(request.payload);

    const { userId } = request.auth.credentials;
    const { targetEmail } = request.payload;

    const message = {
      userId,
      targetEmail,
    };

    await this._service.sendMessage(MessageQueueName, JSON.stringify(message));

    return h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    }).code(201);
  }
}

module.exports = { ExportHandler };
