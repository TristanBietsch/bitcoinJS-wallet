import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'
import { ThemedText } from '@/src/components/ThemedText'
import Dropdown from '@/src/components/common/Dropdown'
import IOSDropdown from '@/src/components/common/IOSDropdown'
import { ChevronLeft } from 'lucide-react-native'

// Currency options for the dropdown
const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' },
  { label: 'BTC', value: 'BTC' },
  { label: 'SATS', value: 'SATS' },
]

// Currency type definition
type CurrencyType = 'USD' | 'BTC' | 'SATS';

// Constants
const SATS_PER_BTC = 100000000 // 1 BTC = 100,000,000 SATS (this is a fixed value)

export default function SendAmountScreen() {
  const router = useRouter()
  const _params = useLocalSearchParams<{ address: string; speed: string }>()
  
  // State for amount and currency
  const [ amount, setAmount ] = useState('0')
  const [ currency, setCurrency ] = useState<CurrencyType>('USD')
  const [ conversionDisabled, setConversionDisabled ] = useState(false)
  
  // State for Bitcoin price
  const [ btcPrice, setBtcPrice ] = useState<number | null>(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ _error, setError ] = useState<string | null>(null)
  
  // Dummy balance for display
  const balance = '$2,257.65'
  
  // Fetch the current Bitcoin price
  const fetchBitcoinPrice = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Using CoinGecko API to get the current Bitcoin price in USD
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      
      if (!response.ok) {
        throw new Error('Failed to fetch Bitcoin price')
      }
      
      const data = await response.json()
      const price = data.bitcoin.usd
      
      if (!price) {
        throw new Error('Invalid price data')
      }
      
      setBtcPrice(price)
      setIsLoading(false)
    } catch (err) {
      setError('Failed to fetch Bitcoin price. Using fallback value.')
      setBtcPrice(60000) // Fallback price if API fails
      setIsLoading(false)
      console.error('Error fetching Bitcoin price:', err)
    }
  }
  
  // Fetch Bitcoin price on component mount
  useEffect(() => {
    fetchBitcoinPrice()
    
    // Refresh price every 60 seconds
    const intervalId = setInterval(fetchBitcoinPrice, 60000)
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [])
  
  // Convert amount between currencies using real rates
  const convertAmount = (value: string, fromCurrency: CurrencyType, toCurrency: CurrencyType): string => {
    // If price hasn't loaded or currencies are the same, return unchanged
    if (!btcPrice || value === '0' || fromCurrency === toCurrency) return value
    
    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) return '0'
    
    // Convert to BTC as intermediate step
    let valueInBTC = numericValue
    if (fromCurrency === 'USD') {
      valueInBTC = numericValue / btcPrice
    } else if (fromCurrency === 'SATS') {
      valueInBTC = numericValue / SATS_PER_BTC
    }
    
    // Convert from BTC to target currency
    let result = valueInBTC
    if (toCurrency === 'USD') {
      result = valueInBTC * btcPrice
    } else if (toCurrency === 'SATS') {
      result = valueInBTC * SATS_PER_BTC
    }
    
    // Format based on currency type
    if (toCurrency === 'BTC') {
      return result.toFixed(8)
    } else if (toCurrency === 'USD') {
      return result.toFixed(2)
    } else {
      // SATS should be whole numbers
      return Math.round(result).toString()
    }
  }
  
  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    const newCurrencyType = newCurrency as CurrencyType
    if (currency !== newCurrencyType && !conversionDisabled) {
      const newAmount = convertAmount(amount, currency, newCurrencyType)
      setAmount(newAmount)
    }
    setCurrency(newCurrencyType)
  }
  
  // Handle input
  const handleNumberPress = (num: string) => {
    // Enable conversion when user manually enters a value
    setConversionDisabled(false)
    
    setAmount(prev => {
      if (prev === '0' && num !== '.') return num
      if (num === '.' && prev.includes('.')) return prev
      return prev + num
    })
  }
  
  const handleBackspace = () => {
    // Enable conversion when user manually enters a value
    setConversionDisabled(false)
    
    setAmount(prev => prev.length <= 1 ? '0' : prev.slice(0, -1))
  }
  
  // Navigate back to address screen
  const handleBackPress = () => {
    router.back()
  }
  
  // Example of using the passed params:
  // const { address, speed } = params
  // These will be used when implementing the final send functionality
  
  // Render number key
  const renderNumberKey = (value: string) => (
    <TouchableOpacity 
      key={value}
      style={styles.numberKey} 
      onPress={() => handleNumberPress(value)}
    >
      <ThemedText style={styles.numberKeyText}>{value}</ThemedText>
    </TouchableOpacity>
  )
  
  // Number pad keys layout
  const numberPadKeys = [
    [ '1', '2', '3' ],
    [ '4', '5', '6' ],
    [ '7', '8', '9' ],
    [ '.', '0', '⌫' ]
  ]
  
  // Format displayed amount based on currency
  const getFormattedAmount = () => {
    if (currency === 'USD') {
      return amount.includes('.') ? amount : `${amount}.00`
    }
    return amount
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown : false, // Hide the navigation bar completely
        }} 
      />
      
      {/* Custom Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>
      
      {/* Amount Display */}
      <View style={styles.amountContainer}>
        <View style={styles.amountDisplay}>
          <ThemedText style={styles.amountText}>
            {getFormattedAmount()}<ThemedText style={styles.currencyText}>{currency}</ThemedText>
          </ThemedText>
        </View>
        
        <ThemedText style={styles.balanceText}>
          Your balance {balance}
        </ThemedText>
        
        {/* Currency Toggle */}
        <View style={styles.currencyToggleContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="red" />
          ) : (
            Platform.OS === 'ios' ? (
              <IOSDropdown
                options={CURRENCY_OPTIONS}
                selectedValue={currency}
                onSelect={handleCurrencyChange}
                title="Select Currency"
                cancelButtonLabel="Cancel"
                backgroundColor="red"
              />
            ) : (
              <Dropdown
                options={CURRENCY_OPTIONS}
                selectedValue={currency}
                onSelect={handleCurrencyChange}
                placeholder="Select Currency"
                backgroundColor="red"
              />
            )
          )}
        </View>
      </View>
      
      <View style={styles.footerContainer}>
        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton}>
          <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
        </TouchableOpacity>
        
        {/* Number Pad */}
        <View style={styles.numberPadContainer}>
          {numberPadKeys.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.numberPadRow}>
              {row.map(key => 
                key === '⌫' ? (
                  <TouchableOpacity 
                    key={key}
                    style={styles.numberKey} 
                    onPress={handleBackspace}
                  >
                    <ThemedText style={styles.numberKeyText}>{key}</ThemedText>
                  </TouchableOpacity>
                ) : renderNumberKey(key)
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : 'white',
    padding         : 0,
  },
  backButton : {
    position       : 'absolute',
    top            : 70,
    left           : 16,
    zIndex         : 10,
    width          : 40,
    height         : 40,
    borderRadius   : 20,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  amountContainer : {
    flex           : 0,
    justifyContent : 'flex-start',
    alignItems     : 'center',
    paddingTop     : 120,
    marginBottom   : 20,
  },
  amountDisplay : { 
    marginBottom : 4,
  },
  amountText : {
    fontSize   : 48,
    fontWeight : 'bold',
    color      : 'black',
  },
  currencyText : {
    fontSize   : 32,
    color      : 'gray',
    marginLeft : 4,
  },
  balanceText : {
    fontSize     : 14,
    color        : 'gray',
    marginBottom : 0,
  },
  currencyToggleContainer : {
    marginVertical : 12,
    width          : 150,
    height         : 36,
    justifyContent : 'center',
  },
  footerContainer : {
    position      : 'absolute',
    bottom        : 0,
    left          : 0,
    right         : 0,
    paddingBottom : 32,
  },
  continueButton : {
    backgroundColor  : 'red',
    paddingVertical  : 16,
    borderRadius     : 30,
    marginBottom     : 40,
    marginHorizontal : 24,
    alignItems       : 'center',
  },
  continueButtonText : {
    color      : 'white',
    fontSize   : 16,
    fontWeight : 'bold',
  },
  numberPadContainer : {
    paddingHorizontal : 24,
  },
  numberPadRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    marginBottom   : 24,
  },
  numberKey : {
    width          : 60,
    height         : 60,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  numberKeyText : {
    fontSize : 32,
    color    : 'black',
  },
}) 