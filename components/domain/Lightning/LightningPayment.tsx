import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LightningPayment: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Lightning Payment Component</Text>
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

export default LightningPayment; 