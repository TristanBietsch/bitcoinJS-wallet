import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BackupStep: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Backup Step Component</Text>
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

export default BackupStep; 