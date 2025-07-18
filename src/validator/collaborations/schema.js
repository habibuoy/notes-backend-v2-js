const Joi = require('joi');

const PostCollaborationPayloadSchema = Joi.object({
  noteId: Joi.string().required(),
  userId: Joi.string().required(),
});

const DeleteCollaborationPayloadSchema = Joi.object({
  noteId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { PostCollaborationPayloadSchema, DeleteCollaborationPayloadSchema };
