import * as jwt from 'jsonwebtoken';
import { Injectable, NestMiddleware } from '@nestjs/common';

import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequireAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    try {
      const decoded = jwt.verify(token, publicKey);
      req.app.set('user', decoded);
    } catch (error) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    next();
  }
}
