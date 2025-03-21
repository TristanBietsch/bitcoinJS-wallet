import { Request, Response, NextFunction } from 'express'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Authentication logic here
    next()
} 