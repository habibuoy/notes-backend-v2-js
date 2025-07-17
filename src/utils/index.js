/* eslint-disable camelcase */

const mapDBToModel = ({
  id,
  title,
  body,
  tags,
  created_at,
  updated_at,
  owner,
  username,
}) => ({
  id,
  title,
  body,
  tags,
  createdAt: created_at,
  updatedAt: updated_at,
  owner,
  username,
});

module.exports = { mapDBToModel };
