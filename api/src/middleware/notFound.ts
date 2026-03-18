import { Request, Response } from 'express';
import { createError } from './errorHandler';

export const notFound = (req: Request, res: Response): void => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  res.status(404).json({
    error: {
      message: error.message,
      statusCode: 404,
    },
  });
};
