const Joi = require('joi');

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().pattern(/^image\//).required(),
}).unknown();

module.exports = { ImageHeadersSchema };
