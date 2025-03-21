import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'

// Configure the rate limit
const limiter = rateLimit({
    windowMs : 15 * 60 * 1000, // 15 minutes
    max      : 100, // Limit each IP to 100 requests per windowMs
    message  : 'Too many requests from this IP, please try again later.'
})

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    limiter(req, res, next)
} 