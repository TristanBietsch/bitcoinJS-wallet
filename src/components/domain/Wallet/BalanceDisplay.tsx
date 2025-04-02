import React from 'react'
import { Text, VStack, HStack, Box } from "@gluestack-ui/themed"
import { useColorMode } from '@gluestack-ui/themed'

interface BalanceDisplayProps {
  balance: number;
  currency: string;
  balanceInFiat?: number;
  fiatCurrency?: string;
  showFiat?: boolean;
}

/**
 * Displays the wallet balance in both crypto and fiat currencies
 * Adapts to light/dark mode via Gluestack UI theming
 */
const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  currency,
  balanceInFiat,
  fiatCurrency = 'USD',
  showFiat = true,
}) => {
  const colorMode = useColorMode()
  
  return (
    <Box 
      alignItems="center" 
      padding={16}
      backgroundColor={colorMode === 'dark' ? '$gray800' : '$gray100'}
      borderRadius="$lg"
    >
      <VStack gap={16} alignItems="center">
        <Text
          fontSize={16}
          color="$gray500"
        >
          Current Balance
        </Text>
        <HStack alignItems="baseline">
          <Text
            fontSize={36}
            fontWeight="bold"
          >
            {balance.toLocaleString()}
          </Text>
          <Text
            fontSize={24}
            fontWeight="semibold"
            marginLeft={4}
          >
            {currency}
          </Text>
        </HStack>
        
        {showFiat && balanceInFiat !== undefined && (
          <Text
            fontSize={14}
            color="$gray500"
            marginTop={4}
          >
            ≈ {balanceInFiat.toLocaleString()} {fiatCurrency}
          </Text>
        )}
      </VStack>
    </Box>
  )
}

export default BalanceDisplay 