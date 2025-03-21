/**
 * Mock data for wallet tests
 */

export const mockWalletBalanceData = {
  loading : {
    btcAmount  : 0,
    usdAmount  : 0,
    satsAmount : 0,
    isLoading  : true,
    error      : null,
    refetch    : jest.fn(),
  },
  success : {
    btcAmount  : 1.47299012,
    usdAmount  : 99999.99,
    satsAmount : 147299012,
    isLoading  : false,
    error      : null,
    refetch    : jest.fn(),
  },
  error : {
    btcAmount  : 0,
    usdAmount  : 0,
    satsAmount : 0,
    isLoading  : false, 
    error      : 'Failed to load balance data',
    refetch    : jest.fn(),
  }
}

export const mockCurrencyFormats = {
  BTC  : '�1.47299012',
  USD  : '$99,999.99',
  SATS : '147,299,012'
}