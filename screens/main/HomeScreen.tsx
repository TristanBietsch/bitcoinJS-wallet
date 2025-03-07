import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const HomeScreen = () => {
  const [currency, setCurrency] = useState('USD');
  
  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'BTC' : 'USD');
  };

  return (
    <View style={styles.container}>
      {/* Gray square in top-right for profile or menu */}
      <View style={styles.topRightIcon} />
      
      {/* Balance Display Section */}
      <View style={styles.balanceContainer}>
        <ThemedText type="default" style={styles.balanceLabel}>
          Current Balance:
        </ThemedText>
        <ThemedText style={styles.balanceAmount}>
          $100,000
        </ThemedText>
        
        {/* Currency Selector */}
        <Pressable 
          style={styles.currencySelector}
          onPress={toggleCurrency}
        >
          <ThemedText style={styles.currencySelectorText}>
            {currency} ▼
          </ThemedText>
        </Pressable>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <ThemedText style={styles.actionButtonText}>Send</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <ThemedText style={styles.actionButtonText}>Receive</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  topRightIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  balanceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currencySelector: {
    backgroundColor: 'red',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySelectorText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: 'red',
    borderRadius: 30,
    width: '48%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default HomeScreen; 