class UserHandler {
  constructor(userService, userValidator) {
    this._service = userService;
    this._validator = userValidator;
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);

    const result = await this._service.addUser(request.payload);

    return h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId: result.id,
      },
    }).code(201);
  }

  async getUserByIdHandler(request, h) {
    const { id } = request.params;

    const result = await this._service.getUserById(id);

    return h.response({
      status: 'success',
      data: {
        user: result,
      },
    });
  }

  async getUsersHandler(request, h) {
    await this._validator.validateUserQuery(request.query);

    const { username } = request.query;
    const result = await this._service.getUsers({ username });

    return h.response({
      status: 'success',
      data: {
        users: result,
      },
    });
  }
}

module.exports = { UserHandler };
