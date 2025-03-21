import { Request, Response, NextFunction } from 'express'

export const errorLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Error logging logic here
    next()
} 