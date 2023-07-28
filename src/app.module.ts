import * as Joi from 'joi';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TasksModule } from './tasks/tasks.module';
import { RequireAuthMiddleware } from './middleware/requireAuth.middleware';
import { DatabaseModule } from './db/db.module';
import { AppLoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 60,
    }),
    TasksModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequireAuthMiddleware)
      .exclude(
        { path: '/health', method: RequestMethod.GET },
        { path: '/docs', method: RequestMethod.GET },
      )
      .forRoutes('*');
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
