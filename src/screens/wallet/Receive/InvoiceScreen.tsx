import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { ChevronLeft, Share2, Copy, Check } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

// Mock bitcoin address - in production this would come from your wallet service
const MOCK_BITCOIN_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

// Constants from ReceiveScreen
const SATS_PER_BTC = 100000000;

export default function InvoiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ amount: string; currency: string }>();
  const [copied, setCopied] = useState(false);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Bitcoin price
  const fetchBitcoinPrice = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      if (!response.ok) throw new Error('Failed to fetch Bitcoin price');
      const data = await response.json();
      setBtcPrice(data.bitcoin.usd);
    } catch (err) {
      console.error('Error fetching price:', err);
      setBtcPrice(60000); // Fallback price
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBitcoinPrice();
  }, []);

  // Convert amount to SATS and USD
  const getConvertedAmounts = () => {
    if (!btcPrice || !params.amount) return { sats: '0', usd: '0' };

    const amount = parseFloat(params.amount);
    if (isNaN(amount)) return { sats: '0', usd: '0' };

    let satsAmount: number;
    let usdAmount: number;

    if (params.currency === 'SATS') {
      satsAmount = amount;
      usdAmount = (amount / SATS_PER_BTC) * btcPrice;
    } else if (params.currency === 'USD') {
      usdAmount = amount;
      satsAmount = (amount / btcPrice) * SATS_PER_BTC;
    } else { // BTC
      satsAmount = amount * SATS_PER_BTC;
      usdAmount = amount * btcPrice;
    }

    return {
      sats: Math.round(satsAmount).toString(),
      usd: usdAmount.toFixed(2)
    };
  };

  const amounts = getConvertedAmounts();

  // Handle back navigation
  const handleBackPress = () => {
    router.back();
  };

  // Handle sharing the payment details
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Bitcoin Payment Request\nAmount: ${params.amount} ${params.currency}\nAddress: ${MOCK_BITCOIN_ADDRESS}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Handle copying the bitcoin address
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(MOCK_BITCOIN_ADDRESS);
      setCopied(true);
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Format the bitcoin address into three lines
  const formatAddress = (address: string) => {
    const length = address.length;
    const chunkSize = Math.ceil(length / 3);
    return [
      address.slice(0, chunkSize),
      address.slice(chunkSize, chunkSize * 2),
      address.slice(chunkSize * 2)
    ];
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBackPress}
        testID="back-button"
      >
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>

      {/* Amount Display */}
      <View style={styles.contentContainer}>
        <ThemedText style={styles.headerText}>Requesting Amount:</ThemedText>
        <View style={styles.amountContainer}>
          <ThemedText style={styles.amountText}>
            {amounts.sats} <ThemedText style={styles.currencyText}>SATS</ThemedText>
          </ThemedText>
          <ThemedText style={styles.usdText}>
            ~${amounts.usd}
          </ThemedText>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer} testID="qr-container">
          <QRCode
            value={MOCK_BITCOIN_ADDRESS}
            size={240}
            backgroundColor="white"
            color="black"
          />
        </View>

        {/* Address Display */}
        <ThemedText style={styles.addressLabel}>on-chain address:</ThemedText>
        <View style={styles.addressBox}>
          {formatAddress(MOCK_BITCOIN_ADDRESS).map((line, index) => (
            <ThemedText key={index} style={styles.addressText}>{line}</ThemedText>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]} 
            onPress={handleShare}
            testID="share-button"
          >
            <Share2 size={24} color="white" />
            <ThemedText style={styles.buttonText}>Share</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.copyButton]} 
            onPress={handleCopy}
            testID="copy-button"
          >
            {copied ? (
              <Check size={24} color="white" testID="check-icon" />
            ) : (
              <Copy size={24} color="white" testID="copy-icon" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 24,
  },
  headerText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 8,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  currencyText: {
    fontSize: 32,
    color: 'gray',
  },
  usdText: {
    fontSize: 16,
    color: 'gray',
  },
  qrContainer: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 32,
    width: '100%',
    maxWidth: 288,
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 12,
  },
  addressBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '67%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  addressText: {
    fontSize: 18,
    color: 'black',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    letterSpacing: 1,
    lineHeight: 28,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    backgroundColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  shareButton: {
    paddingHorizontal: 32,
    flex: 1,
    maxWidth: 200,
  },
  copyButton: {
    width: 48,
    height: 48,
    padding: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 