/**
 * Bitcoin Address Display Component
 * Displays a Bitcoin address with QR code for receiving payments
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card, QRCode } from '@gluestack-ui/themed';
import { useBitcoinWallet } from '../../../hooks/bitcoin/useBitcoinWallet';

interface AddressDisplayProps {
  initialAddress?: string;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ initialAddress }) => {
  const { getNewAddress } = useBitcoinWallet();
  const [address, setAddress] = useState<string>(initialAddress || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateNewAddress = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const addressData = await getNewAddress();
      if (addressData) {
        setAddress(addressData.address);
      } else {
        setError('Failed to generate address');
      }
    } catch (err) {
      setError('Error generating new address');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate an address if none was provided
  React.useEffect(() => {
    if (!initialAddress) {
      generateNewAddress();
    }
  }, [initialAddress]);

  return (
    <Card style={styles.container}>
      <Text size="lg" fontWeight="bold" style={styles.title}>
        Receive Bitcoin
      </Text>
      
      {error ? (
        <Text color="red" style={styles.error}>
          {error}
        </Text>
      ) : null}
      
      <View style={styles.qrContainer}>
        {address ? (
          <QRCode
            size="xl"
            value={address}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      
      <Text style={styles.addressLabel}>Bitcoin Address:</Text>
      <Text selectable style={styles.addressText}>
        {address || 'Generating address...'}
      </Text>
      
      <Button
        onPress={generateNewAddress}
        isDisabled={isLoading}
        style={styles.button}
      >
        <Button.Text>Generate New Address</Button.Text>
      </Button>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 16,
  },
  qrContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  placeholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  addressLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressText: {
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'monospace',
  },
  button: {
    marginTop: 10,
  },
  error: {
    marginBottom: 10,
  },
});

export default AddressDisplay; 