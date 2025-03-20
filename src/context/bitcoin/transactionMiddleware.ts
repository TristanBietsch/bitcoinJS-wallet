/**
 * Bitcoin Transaction Middleware
 * Handles validation and processing of Bitcoin transactions
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Validates a Bitcoin transaction request
 */
export const validateTransactionRequest = (req: Request, res: Response, next: NextFunction) => {
  const { address, amount, feeRate } = req.body;
  
  // Basic validation checks
  if (!address || !amount) {
    return res.status(400).json({ 
      error: 'Invalid transaction request',
      message: 'Address and amount are required' 
    });
  }

  // Validate Bitcoin address format
  const isValidAddress = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
  if (!isValidAddress) {
    return res.status(400).json({ 
      error: 'Invalid Bitcoin address',
      message: 'Please provide a valid Bitcoin address' 
    });
  }

  // Validate amount is a positive number
  if (amount <= 0) {
    return res.status(400).json({ 
      error: 'Invalid amount',
      message: 'Amount must be greater than 0' 
    });
  }

  next();
};

/**
 * Fee estimation middleware
 */
export const estimateFeeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // We would typically fetch dynamic fee rates from mempool.space or similar
  // For now, using placeholder logic
  req.body.suggestedFees = {
    high: 15, // sats/vB
    medium: 8,
    low: 3
  };
  
  next();
}; 