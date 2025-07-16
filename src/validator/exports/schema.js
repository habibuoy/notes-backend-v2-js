const Joi = require('joi');

const ExportNotesPayloadSchema = Joi.object({
  targetEmail: Joi.string().email().required(),
});

module.exports = { ExportNotesPayloadSchema };
