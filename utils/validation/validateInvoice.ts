export const validateInvoice = (invoice: { amount: number; date: Date }): boolean => {
    return invoice.amount > 0 && invoice.date instanceof Date;
}; 