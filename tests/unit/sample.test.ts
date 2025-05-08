/**
 * Sample unit test for Bitcoin wallet functionality
 */

interface BitcoinAmount {
  satoshis: number;
  btc: number;
}

// Simple utility function to convert between BTC and satoshis
function convertToBtc(satoshis: number): BitcoinAmount {
  const btc = satoshis / 100000000
  return {
    satoshis,
    btc
  }
}

describe('Bitcoin Unit Conversion', () => {
  it('should convert satoshis to BTC correctly', () => {
    const result = convertToBtc(100000000)
    expect(result.btc).toBe(1)
    expect(result.satoshis).toBe(100000000)
  })

  it('should handle fractional BTC', () => {
    const result = convertToBtc(50000000)
    expect(result.btc).toBe(0.5)
    expect(result.satoshis).toBe(50000000)
  })

  it('should handle small amounts', () => {
    const result = convertToBtc(1000)
    expect(result.btc).toBe(0.00001)
    expect(result.satoshis).toBe(1000)
  })
}) 