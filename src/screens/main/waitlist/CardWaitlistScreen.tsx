import React from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { ArrowRight } from 'lucide-react-native'
import { ThemedText } from '@/src/components/common/ThemedText'
import { ThemedView } from '@/src/components/common/ThemedView'
import { FeatureChips } from '@/src/components/domain/Card/FeatureChips'
import { useWaitlist } from '@/src/hooks/useWaitlist'
import { Colors } from '@/src/constants/colors'
import useColorScheme from '@/src/hooks/ui/useColorScheme'

const CardWaitlistScreen = () => {
  const waitlist = useWaitlist()
  const {
    email,
    setEmail,
    isLoading,
    isRegistered,
    registeredEmail,
    submitToWaitlist,
  } = waitlist
  
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]
  
  // Handle form submission
  const handleSubmit = async () => {
    await submitToWaitlist()
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Image */}
          <View style={styles.cardImageContainer}>
            <Image
              source={require('@/assets/images/nummus-card.png')}
              style={styles.cardImage}
              contentFit="contain"
              transition={500}
            />
          </View>

          {/* Header Text */}
          <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.title}>
              {isRegistered ? "You're on the list!" : "Join the Waitlist"}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {isRegistered
                ? `We'll notify ${registeredEmail} when your card is ready.`
                : "Get early access to the Nummus Bitcoin Card."}
            </ThemedText>
          </View>

          {/* Feature Chips */}
          <FeatureChips />

          {/* Email Input and Submit Button */}
          {!isRegistered ? (
            <View style={styles.formContainer}>
              <TextInput
                style={[
                  styles.emailInput,
                  { 
                    color       : colors.text, 
                    borderColor : colorScheme === 'light' ? Colors.light.subtleBorder : colors.text 
                  }
                ]}
                placeholder="Email Address"
                placeholderTextColor={colorScheme === 'light' ? Colors.light.inactiveGray : colors.icon}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colorScheme === 'light' ? Colors.light.errorRed : colors.tint }
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <ThemedText style={styles.buttonText}>Join Now</ThemedText>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successContainer}>
              <View 
                style={[
                  styles.successBadge, 
                  { backgroundColor: colorScheme === 'light' ? Colors.light.successGreen : colors.tint }
                ]}
              >
                <ThemedText style={styles.successText}>
                  You're on the waitlist!
                </ThemedText>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container : {
    marginTop : 70,
    flex      : 1,
  },
  keyboardAvoid : {
    flex : 1,
  },
  scrollContent : {
    flexGrow          : 1,
    paddingHorizontal : 20,
    paddingBottom     : 40,
    alignItems        : 'center',
  },
  cardImageContainer : {
    width          : '100%',
    height         : 220,
    marginTop      : 40,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  cardImage : {
    width  : '90%',
    height : '100%',
  },
  headerContainer : {
    width      : '100%',
    alignItems : 'center',
    marginTop  : 20,
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10,
  },
  subtitle : {
    fontSize          : 16,
    textAlign         : 'center',
    marginBottom      : 20,
    paddingHorizontal : 20,
  },
  formContainer : {
    width     : '100%',
    marginTop : 20,
  },
  emailInput : {
    width             : '100%',
    height            : 50,
    borderWidth       : 1,
    borderRadius      : 8,
    paddingHorizontal : 15,
    fontSize          : 16,
    marginBottom      : 15,
  },
  submitButton : {
    width          : '100%',
    height         : 50,
    borderRadius   : 25,
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  buttonText : {
    color       : '#FFFFFF',
    fontSize    : 16,
    fontWeight  : '600',
    marginRight : 8,
  },
  successContainer : {
    width      : '100%',
    alignItems : 'center',
    marginTop  : 30,
  },
  successBadge : {
    paddingVertical   : 10,
    paddingHorizontal : 20,
    borderRadius      : 20,
  },
  successText : {
    color      : '#FFFFFF',
    fontWeight : '600',
  },
})

export default CardWaitlistScreen 

