import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import CardWaitlistScreen from '@/src/screens/main/waitlist/CardWaitlistScreen'
import { setupTestEnv } from '../utils/testConfig'
import { clearWaitlistTestData, generateTestEmail } from '../utils/testUtils'

// Setup test environment
setupTestEnv()

// Don't mock the useWaitlist hook - we want to test with real implementation
jest.unmock('@/hooks/useWaitlist')

// Create minimal mock for components that might cause issues in tests
jest.mock('expo-image', () => ({
  Image : 'Image'
}))

jest.mock('@/components/domain/Card/FeatureChips', () => ({
  FeatureChips : () => null
}))

// Toast mock
jest.mock('@/components/ui/toast', () => ({
  useToast : () => ({
    show : jest.fn()
  }),
  Toast            : ({ children }: { children: React.ReactNode }) => children,
  ToastTitle       : ({ children }: { children: React.ReactNode }) => children,
  ToastDescription : ({ children }: { children: React.ReactNode }) => children
}))

describe('CardWaitlistScreen Component', () => {
  // Use a unique email for testing
  const testEmail = generateTestEmail('component')
  
  // Clean up before and after tests
  beforeAll(async () => {
    await clearWaitlistTestData(testEmail)
  })
  
  afterAll(async () => {
    await clearWaitlistTestData(testEmail)
  })
  
  it('should render the join waitlist form initially', () => {
    // When: Component is rendered
    const { getByPlaceholderText, getByText } = render(<CardWaitlistScreen />)
    
    // Then: Should show the form elements
    expect(getByPlaceholderText('Email Address')).toBeTruthy()
    expect(getByText('Join Now')).toBeTruthy()
  })
  
  it('should update email input when typed', () => {
    // Given: Component is rendered
    const { getByPlaceholderText } = render(<CardWaitlistScreen />)
    const emailInput = getByPlaceholderText('Email Address')
    
    // When: Typing in the email input
    fireEvent.changeText(emailInput, testEmail)
    
    // Then: Input value should be updated
    expect(emailInput.props.value).toBe(testEmail)
  })
  
  it('should submit the form and show success state', async () => {
    // Given: Component is rendered with email
    const { getByPlaceholderText, getByText, queryByText } = render(<CardWaitlistScreen />)
    
    // When: Entering email and submitting form
    const emailInput = getByPlaceholderText('Email Address')
    fireEvent.changeText(emailInput, testEmail)
    
    const submitButton = getByText('Join Now')
    fireEvent.press(submitButton)
    
    // Then: Success message should appear after submission (may take a moment)
    await waitFor(() => {
      const successElement = queryByText(/You're on the list!/i)
      expect(successElement).toBeTruthy()
    }, { timeout: 3000 })
    
    // And: Should show the registered email
    await waitFor(() => {
      const emailConfirmation = queryByText(new RegExp(`We'll notify ${testEmail}`, 'i'))
      expect(emailConfirmation).toBeTruthy()
    }, { timeout: 1000 })
  })
}) 