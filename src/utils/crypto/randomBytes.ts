import crypto from 'crypto'

export const generateRandomBytes = (size: number): Buffer => {
    return crypto.randomBytes(size)
} 