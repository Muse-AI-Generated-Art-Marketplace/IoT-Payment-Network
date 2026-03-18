import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Placeholder authentication middleware
  // In a real implementation, verify JWT token here
  next();
};
