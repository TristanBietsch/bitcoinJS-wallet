import React from 'react'
import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { COLORS } from '@/src/types/theme/colors.types'

interface BalanceDisplayProps {
  balance: number;
  currency: string;
  balanceInFiat?: number;
  fiatCurrency?: string;
  showFiat?: boolean;
}

/**
 * Displays the wallet balance in both crypto and fiat currencies
 * Adapts to light/dark mode via React Native's useColorScheme
 */
const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  currency,
  balanceInFiat,
  fiatCurrency = 'USD',
  showFiat = true,
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? COLORS.textSecondary : COLORS.white }
    ]}>
      <View style={styles.content}>
        <Text style={styles.label}>
          Current Balance
        </Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balance}>
            {balance.toLocaleString()}
          </Text>
          <Text style={styles.currency}>
            {currency}
          </Text>
        </View>
        
        {showFiat && balanceInFiat !== undefined && (
          <Text style={styles.fiatBalance}>
            ≈ {balanceInFiat.toLocaleString()} {fiatCurrency}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    padding      : 16,
    borderRadius : 12,
    alignItems   : 'center',
  },
  content : {
    alignItems : 'center',
    gap        : 16,
  },
  label : {
    fontSize : 16,
    color    : COLORS.textSecondary,
  },
  balanceRow : {
    flexDirection : 'row',
    alignItems    : 'baseline',
  },
  balance : {
    fontSize   : 36,
    fontWeight : 'bold',
    color      : COLORS.text,
  },
  currency : {
    fontSize   : 24,
    fontWeight : '600',
    marginLeft : 4,
    color      : COLORS.text,
  },
  fiatBalance : {
    fontSize  : 14,
    color     : COLORS.textSecondary,
    marginTop : 4,
  },
})

export default BalanceDisplay 