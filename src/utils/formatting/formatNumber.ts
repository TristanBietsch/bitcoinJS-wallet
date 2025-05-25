export const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return '0'
  return num.toLocaleString('en-US')
} 