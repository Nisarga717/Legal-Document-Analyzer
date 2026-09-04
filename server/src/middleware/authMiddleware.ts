import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Optional auth: continue without error, req.userId remains undefined
    next();
    return;
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';
  jwt.verify(token, secret, (err, decoded: any) => {
    if (!err && decoded && decoded.id) {
      req.userId = decoded.id;
    }
    next();
  });
};
