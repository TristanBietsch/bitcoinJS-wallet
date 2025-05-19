import { create } from 'zustand'
import { getBTCPrice } from '@/src/services/api/btcPriceService'

interface PriceState {
  btcPrice: number | null
  isLoading: boolean
  error: string | null
  intervalId?: NodeJS.Timeout // Or just 'any' for simplicity if platform varies
  fetchPrice: () => Promise<void>
  initializePriceFetching: (refreshInterval?: number) => void
  clearPriceFetchingInterval: () => void
}

const DEFAULT_REFRESH_INTERVAL = 30000 // 30 seconds

export const usePriceStore = create<PriceState>((set, get) => ({
  btcPrice   : null,
  isLoading  : false,
  error      : null,
  intervalId : undefined,

  fetchPrice : async () => {
    set({ isLoading: true, error: null })
    try {
      const price = await getBTCPrice()
      set({ btcPrice: price, isLoading: false })
    } catch (err) {
      console.error('Error fetching BTC price:', err)
      set({ error: 'Failed to fetch Bitcoin price', isLoading: false, btcPrice: null })
    }
  },

  initializePriceFetching : (refreshInterval = DEFAULT_REFRESH_INTERVAL) => {
    const { fetchPrice, intervalId, clearPriceFetchingInterval } = get()
    if (intervalId) {
      clearPriceFetchingInterval()
    }
    fetchPrice() // Fetch immediately
    const newIntervalId = setInterval(fetchPrice, refreshInterval)
    set({ intervalId: newIntervalId })
  },

  clearPriceFetchingInterval : () => {
    const { intervalId } = get()
    if (intervalId) {
      clearInterval(intervalId)
      set({ intervalId: undefined })
    }
  },
}))

// Optional: Auto-initialize when the app loads, if desired.
// This would typically be done in a top-level component like _layout.tsx or App.tsx
// For example:
// useEffect(() => {
//   usePriceStore.getState().initializePriceFetching();
//   return () => {
//     usePriceStore.getState().clearPriceFetchingInterval();
//   };
// }, []); 