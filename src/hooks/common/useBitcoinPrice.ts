import { useQuery } from '@tanstack/react-query'
import { getBitcoinPrice } from '@/src/services/bitcoin'
import { useMemo } from 'react'

interface BitcoinPriceResponse {
  price: number
}

export const useBitcoinPrice = () => {
  const { data, isLoading, error } = useQuery<BitcoinPriceResponse>({
    queryKey        : [ 'bitcoinPrice' ],
    queryFn         : getBitcoinPrice,
    staleTime       : 5 * 60 * 1000, // 5 minutes
    refetchInterval : 5 * 60 * 1000, // 5 minutes
  })

  const price = useMemo(() => {
    if (!data) return null
    return data.price
  }, [ data ])

  return {
    price,
    isLoading,
    error,
  }
} 