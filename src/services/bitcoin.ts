import { fetchCurrentPrice } from '@/src/services/api/price'

export const getBitcoinPrice = async () => {
  try {
    const price = await fetchCurrentPrice()
    return { price }
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error)
    return { price: 60000 } // Fallback price if API fails
  }
} 