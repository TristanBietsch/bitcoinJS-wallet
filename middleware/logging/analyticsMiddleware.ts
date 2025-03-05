import { Request, Response, NextFunction } from 'express';

export const analyticsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Analytics logic here
    next();
}; 