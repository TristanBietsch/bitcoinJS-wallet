import { Request, Response, NextFunction } from 'express';

export const nodeConnectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Node connection logic here
    next();
}; 