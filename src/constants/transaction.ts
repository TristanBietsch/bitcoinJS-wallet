/**
 * Constants for transaction-related components and screens
 */

export const TransactionConstants = {
  labels : {
    amount        : 'Amount',
    networkFee    : 'Network Fee',
    total         : 'Total',
    viewOnMempool : 'View on Mempool',
  },
  status : {
    sent     : 'Sent',
    received : 'Received',
  },
  mempool : {
    baseUrl : 'https://mempool.space/tx/',
  },
  accessibility : {
    backButton    : 'Go back',
    statusIcon    : (type: 'send' | 'receive') => `${type === 'send' ? 'Sent' : 'Received'} transaction`,
    amountField   : 'Transaction amount',
    addressField  : (type: 'send' | 'receive') => `${type === 'send' ? 'Recipient' : 'Sender'} address`,
    feeField      : 'Network fee',
    totalField    : 'Total transaction amount',
    mempoolButton : 'View transaction on Mempool',
  },
} 