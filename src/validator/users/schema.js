const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

const UserQuerySchema = Joi.object({
  username: Joi.string().empty(''),
});

module.exports = { UserPayloadSchema, UserQuerySchema };
