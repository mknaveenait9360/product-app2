import { Request, Response, NextFunction } from 'express';

export function logTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    console.log('JWT Token:', authHeader.replace('Bearer ', ''));
  } else {
    console.log('No JWT Token found in request');
  }
  next();
}
