class UploadHandler {
  constructor(storageService, uploadsValidator) {
    this._service = storageService;
    this._validator = uploadsValidator;
  }

  async postUploadImagesHandler(request, h) {
    const { data } = request.payload;

    this._validator.validateImageHeaders(data.hapi.headers);

    const filename = await this._service.writeFile(data, data.hapi);

    return h.response({
      status: 'success',
      data: {
        fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`,
      },
    }).code(201);
  }
}

module.exports = { UploadHandler };
