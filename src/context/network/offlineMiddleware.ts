import { Request, Response, NextFunction } from 'express'

export const offlineMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Offline handling logic here
    next()
} 