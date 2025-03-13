import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { OnboardingScreenProps } from '@/types/onboarding';
import WelcomeStep, { welcomeStepConfig } from './WelcomeStep';
import SecurityStep, { securityStepConfig } from './SecurityStep';
import UsageStep, { usageStepConfig } from './UsageStep';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  welcomeStepConfig,
  securityStepConfig,
  usageStepConfig,
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNextSlide = () => {
    if (currentSlide < ONBOARDING_STEPS.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = ONBOARDING_STEPS[currentSlide];
  const StepComponent = currentStep.Component;

  return (
    <View style={styles.container}>
      <View style={styles.slideContainer}>
        <StepComponent onNext={goToNextSlide} />
      </View>

      <View style={styles.pagination}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentSlide && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={goToNextSlide}>
        <Text style={styles.buttonText}>
          {currentSlide === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContainer: {
    width: width - 40,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#000',
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 