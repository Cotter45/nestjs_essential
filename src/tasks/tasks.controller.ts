import * as Joi from 'joi';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  BadRequestException,
  Req,
  Logger,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { BadRequestError } from '../errors.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiBearerAuth('Bearer')
@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @ApiCreatedResponse({
    description: 'Task created successfully',
    type: Task,
    isArray: false,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: BadRequestError,
    isArray: false,
  })
  @Post()
  async create(@Body() data: CreateTaskDto) {
    try {
      const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        status: Joi.string().required(),
      });

      await schema.validateAsync(data);

      return this.tasksService.create(data);
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  @ApiOkResponse({
    description: 'Get tasks by params.',
    type: Task,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: BadRequestError,
    isArray: false,
  })
  @Get()
  async findMany(
    @Req() req: any,
    @Query()
    params: {
      offset?: number;
      limit?: number;
      order?: 'asc' | 'desc';
    },
  ) {
    try {
      const schema = Joi.object({
        offset: Joi.number().optional(),
        limit: Joi.number().optional(),
        order: Joi.string().optional(),
      });

      await schema.validateAsync(params);

      return this.tasksService.findMany({
        limit: params.limit || 20,
        offset: params.offset || 0,
        order: params.order || 'desc',
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  @ApiOkResponse({
    description: 'Search by title or description.',
    type: Task,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: BadRequestError,
    isArray: false,
  })
  @Get('search')
  async search(
    @Query() params: { query: string; limit?: number; offset?: number },
  ) {
    try {
      const schema = Joi.object({
        query: Joi.string().required(),
        limit: Joi.number().optional(),
        offset: Joi.number().optional(),
      });

      await schema.validateAsync(params);

      return this.tasksService.search({
        query: params.query,
        limit: params.limit || 20,
        offset: params.offset || 0,
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  @ApiOkResponse({
    description: 'Get task by id.',
    type: Task,
    isArray: false,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: BadRequestError,
    isArray: false,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const schema = Joi.object({
        id: Joi.number().required(),
      });

      await schema.validateAsync({ id: Number(id) });

      return this.tasksService.findOne(Number(id));
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  @ApiOkResponse({
    description: 'Task updated successfully',
    type: Task,
    isArray: false,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: BadRequestError,
    isArray: false,
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateTaskDto) {
    try {
      const schema = Joi.object({
        id: Joi.number().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        status: Joi.string().optional(),
      });

      await schema.validateAsync({ ...data, id: Number(id) });

      return this.tasksService.update(data);
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  @ApiOkResponse({
    description: 'Task deleted successfully',
    type: Task,
    isArray: false,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: BadRequestError,
    isArray: false,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const schema = Joi.object({
        id: Joi.number().required(),
      });

      await schema.validateAsync({ id: Number(id) });

      return this.tasksService.delete(Number(id));
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }
}
