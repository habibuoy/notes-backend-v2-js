const InvariantError = require('../../exceptions/InvariantError');
const { UserPayloadSchema, UserQuerySchema } = require('./schema');

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUserQuery: (query) => {
    const validationResult = UserQuerySchema.validate(query);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = { UsersValidator };
