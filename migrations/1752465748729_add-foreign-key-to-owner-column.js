/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql("INSERT INTO users VALUES ('old_notes', 'old_notes', 'old_notes', 'old_notes')");

  pgm.sql("UPDATE notes SET owner = 'old_notes' WHERE owner IS NULL");

  pgm.addConstraint(
    'notes',
    'fk_notes.owner.users_id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint(
    'notes',
    'fk_notes.owner.users_id',
  );

  pgm.sql("UPDATE notes SET owner = NULL WHERE owner = 'old_notes'");

  pgm.sql("DELETE FROM users WHERE id = 'old_notes'");
};
