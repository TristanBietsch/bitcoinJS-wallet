import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WalletCreationStep: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Wallet Creation Step Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WalletCreationStep; 