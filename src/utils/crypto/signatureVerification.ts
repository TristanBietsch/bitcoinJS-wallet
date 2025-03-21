import crypto from 'crypto'

export const verifySignature = (data: string, signature: string, publicKey: string): boolean => {
    const verifier = crypto.createVerify('SHA256')
    verifier.update(data)
    return verifier.verify(publicKey, signature, 'hex')
} 