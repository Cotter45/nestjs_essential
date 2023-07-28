import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../db/db.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private db: DatabaseService) {}

  async create(data: CreateTaskDto) {
    const result = await this.db.executeQuery(
      `
      INSERT INTO tasks (title, description, status)
      VALUES ($1, $2, $3)
      RETURNING 
        id,
        title,
        description,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [data.title, data.description, data.status],
    );

    return result[0] as Task;
  }

  async findMany(params: {
    offset?: number;
    limit?: number;
    order?: 'asc' | 'desc';
  }): Promise<Task[]> {
    const { offset, limit, order } = params;

    const result = await this.db.executeQuery(
      `
      SELECT
        id,
        title,
        description,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM tasks
      ORDER BY id ${order}
      LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    );

    return result as Task[];
  }

  async findOne(id: number): Promise<Task> {
    const result = await this.db.executeQuery(
      `
      SELECT
        id,
        title,
        description,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM tasks
      WHERE id = $1
      `,
      [id],
    );

    return result[0] as Task;
  }

  async search(params: {
    query: string;
    offset: number;
    limit: number;
  }): Promise<Task[]> {
    const { query, offset, limit } = params;

    let queryText = '';

    if (query.includes(' ')) {
      queryText = query.trim().split(' ').join(':* | ');
      queryText = `${queryText}:*`;
    } else {
      queryText = `${query}:*`;
    }

    const result = await this.db.executeQuery(
      `
      SELECT
        id,
        title,
        description,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM tasks
      WHERE fts_doc_en @@ to_tsquery($1)
      ORDER BY ts_rank(fts_doc_en, to_tsquery($1)) DESC
      LIMIT $2 OFFSET $3
      `,
      [queryText, limit, offset],
    );

    return result as Task[];
  }

  async update(params: UpdateTaskDto): Promise<Task> {
    const { id, title, description, status } = params;

    const result = await this.db.executeQuery(
      `
      UPDATE tasks
      SET
        title = $1,
        description = $2,
        status = $3
      WHERE id = $4
      RETURNING
        id,
        title,
        description,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [title, description, status, id],
    );

    return result[0] as Task;
  }

  async delete(id: number): Promise<Task> {
    const result = await this.db.executeQuery(
      `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING
        id,
        title,
        description,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [id],
    );

    return result[0] as Task;
  }
}
