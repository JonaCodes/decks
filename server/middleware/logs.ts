import { Request, Response, NextFunction } from 'express';

export const logRequest = (req: Request, _: Response, next: NextFunction) => {
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown';

  console.log(`[${ip}] made a ${req.method} request to ${req.url}`);
  next();
};
