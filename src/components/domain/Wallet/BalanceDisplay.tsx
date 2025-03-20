import React from 'react';
import { View } from 'react-native';
import { Text, VStack, HStack, Box } from "@gluestack-ui/themed";
import { useColorMode } from '@gluestack-ui/themed';

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
  const { colorMode } = useColorMode();
  
  return (
    <Box 
      alignItems="center" 
      p="$4"
      bg={colorMode === 'dark' ? '$gray800' : '$gray100'}
      borderRadius="$lg"
    >
      <VStack space="md" alignItems="center">
        <Text
          fontSize="$md"
          color="$gray500"
        >
          Current Balance
        </Text>
        <HStack alignItems="baseline">
          <Text
            fontSize="$4xl"
            fontWeight="$bold"
          >
            {balance.toLocaleString()}
          </Text>
          <Text
            fontSize="$2xl"
            fontWeight="$semibold"
            ml="$1"
          >
            {currency}
          </Text>
        </HStack>
        
        {showFiat && balanceInFiat !== undefined && (
          <Text
            fontSize="$sm"
            color="$gray500"
            mt="$1"
          >
            ≈ {balanceInFiat.toLocaleString()} {fiatCurrency}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default BalanceDisplay; 