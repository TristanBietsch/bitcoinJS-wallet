import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from '@/src/types/theme/colors.types'
import Card from '../ui/Card'

interface WalletCardProps {
  balance: number;
  currency: string;
  walletName: string;
  onPress?: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  balance,
  currency,
  walletName,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.walletName}>{walletName}</Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balance}>
            {balance.toLocaleString()} <Text style={styles.currency}>{currency}</Text>
          </Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Receive</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card : {
    padding          : 20,
    marginHorizontal : 16,
    marginTop        : 16,
  },
  header : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    marginBottom   : 16,
  },
  walletName : {
    fontSize   : 18,
    fontWeight : '600',
    color      : COLORS.text,
  },
  balanceContainer : {
    marginBottom : 20,
  },
  balanceLabel : {
    fontSize     : 14,
    color        : COLORS.textSecondary,
    marginBottom : 4,
  },
  balance : {
    fontSize   : 28,
    fontWeight : 'bold',
    color      : COLORS.text,
  },
  currency : {
    fontSize   : 20,
    fontWeight : '600',
  },
  actionButtonsContainer : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
  },
  actionButton : {
    flex              : 1,
    backgroundColor   : COLORS.primary,
    paddingVertical   : 10,
    paddingHorizontal : 16,
    borderRadius      : 8,
    marginHorizontal  : 4,
    alignItems        : 'center',
  },
  actionButtonText : {
    color      : COLORS.white,
    fontWeight : '600',
  },
})

export default WalletCard 