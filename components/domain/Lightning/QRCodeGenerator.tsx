import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const QRCodeGenerator: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>QR Code Generator Component</Text>
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

export default QRCodeGenerator; 