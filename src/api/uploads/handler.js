class UploadHandler {
  constructor(storageService, uploadsValidator) {
    this._service = storageService;
    this._validator = uploadsValidator;
  }

  async postUploadImagesHandler(request, h) {
    const { data } = request.payload;

    this._validator.validateImageHeaders(data.hapi.headers);

    const basePathLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images`;
    const location = await this._service.writeFile({
      file: data,
      meta: data.hapi,
      basePathLocation,
    });

    return h.response({
      status: 'success',
      data: {
        fileLocation: location,
      },
    }).code(201);
  }
}

module.exports = { UploadHandler };
