import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

/**
 * JWT authentication middleware.
 * Verifies Bearer token from Authorization header and attaches user to req.user.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
