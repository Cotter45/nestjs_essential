/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('tasks', {
    id: 'id',
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text', notNull: true },
    status: { type: 'varchar(20)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTrigger(
    'tasks',
    'update_timestamp',
    {
      when: 'BEFORE',
      operation: ['UPDATE'],
      level: 'ROW',
      language: 'plpgsql',
      replace: true,
    },
    `
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
    `,
  );

  pgm.addColumns('tasks', {
    fts_doc_en: {
      type: 'tsvector',
      notNull: true,
    },
  });

  pgm.createTrigger(
    'tasks',
    'update_fts_doc_en',
    {
      when: 'BEFORE',
      operation: ['INSERT', 'UPDATE'],
      level: 'ROW',
      language: 'plpgsql',
      replace: true,
    },
    `
      BEGIN
        NEW.fts_doc_en = to_tsvector('english', NEW.title || ' ' || NEW.description);
        RETURN NEW;
      END;
    `,
  );

  pgm.createIndex('tasks', 'fts_doc_en', {
    name: 'tasks_fts_doc_en_idx',
    method: 'gin',
  });
};

exports.down = pgm => {};
