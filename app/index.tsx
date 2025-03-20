import React, { useEffect, useState } from 'react';
import HomeScreen from '@/src/screens/main/home/HomeScreen';
import Onboarding from '@/src/screens/onboarding/OnboardingScreen';
import { isOnboardingComplete, setOnboardingComplete, resetOnboardingStatus } from '@/src/utils/storage';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const completed = await isOnboardingComplete();
    setShowOnboarding(!completed);
    setIsLoading(false);
  };

  const handleOnboardingComplete = async () => {
    await setOnboardingComplete();
    setShowOnboarding(false);
  };

  const handleResetOnboarding = async () => {
    await resetOnboardingStatus();
    setShowOnboarding(true);
  };

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  const content = showOnboarding ? (
    <Onboarding onComplete={handleOnboardingComplete} />
  ) : (
    <HomeScreen />
  );

  // Only show reset button in development
  const isDevelopment = Constants.appOwnership === 'expo' || __DEV__;

  return (
    <View style={styles.container}>
      {content}
      {isDevelopment && !showOnboarding && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetOnboarding}
        >
          <Text style={styles.resetButtonText}>Reset Onboarding</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 100,
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 8,
    opacity: 0.8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
}); 