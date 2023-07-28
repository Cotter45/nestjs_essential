import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const start = performance.now();
    const { ip, method, originalUrl: url } = request;

    response.on('finish', () => {
      const end = performance.now();
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const duration = (end - start).toFixed(2);

      this.logger.log(
        `${method} ${url} ${statusCode} ${contentLength} ${duration}ms - ${ip}`,
      );
    });

    next();
  }
}
