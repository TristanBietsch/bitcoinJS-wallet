import React, { useEffect, useState } from 'react';
import HomeScreen from '@/screens/main/HomeScreen';
import Onboarding from './components/Onboarding';
import { isOnboardingComplete, setOnboardingComplete } from './utils/storage';

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

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  return showOnboarding ? (
    <Onboarding onComplete={handleOnboardingComplete} />
  ) : (
    <HomeScreen />
  );
} 