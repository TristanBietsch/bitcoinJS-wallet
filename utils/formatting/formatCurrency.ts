export const formatCurrency = (amount: number, currencySymbol: string = '$'): string => {
    return `${currencySymbol}${amount.toFixed(2)}`;
}; 