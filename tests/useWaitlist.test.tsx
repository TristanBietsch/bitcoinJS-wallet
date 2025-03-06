import { renderHook, act } from '@testing-library/react-hooks';
import { useWaitlist } from '@/hooks/useWaitlist';
import { setupTestEnv } from './utils/testConfig';
import { clearWaitlistTestData, generateTestEmail } from './utils/testUtils';

// Setup test environment
setupTestEnv();

// Create a provider wrapper to handle toast dependencies
const wrapper = ({ children }: { children: React.ReactNode }) => {
  // Mock the toast context or any other context needed by the hook
  return <>{children}</>;
};

// Don't mock the hook - we want to test the actual implementation
jest.unmock('@/hooks/useWaitlist');

describe('useWaitlist hook integration', () => {
  // Use a unique email for each test to avoid conflicts
  const testEmail = generateTestEmail('hook');
  
  // Clean up before and after tests
  beforeAll(async () => {
    await clearWaitlistTestData(testEmail);
  });
  
  afterAll(async () => {
    await clearWaitlistTestData(testEmail);
  });
  
  it('should initialize with default values', () => {
    // When: Hook is rendered
    const { result } = renderHook(() => useWaitlist(), { wrapper });
    
    // Then: Should have expected properties
    expect(result.current).toHaveProperty('email');
    expect(result.current).toHaveProperty('setEmail');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isRegistered');
    expect(result.current).toHaveProperty('registeredEmail');
    expect(result.current).toHaveProperty('submitToWaitlist');
    expect(result.current).toHaveProperty('validateEmail');
    
    // And: Default values should be set correctly
    expect(result.current.email).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRegistered).toBe(false);
    expect(result.current.registeredEmail).toBeUndefined();
  });

  it('should update email state when setEmail is called', () => {
    // Given: Hook is rendered
    const { result } = renderHook(() => useWaitlist(), { wrapper });
    
    // When: Setting email
    act(() => {
      result.current.setEmail(testEmail);
    });
    
    // Then: Email state should be updated
    expect(result.current.email).toBe(testEmail);
  });

  it('should validate email format correctly', () => {
    // Given: Hook is rendered
    const { result } = renderHook(() => useWaitlist(), { wrapper });
    
    // When/Then: Valid email format
    expect(result.current.validateEmail('valid@example.com')).toBe(true);
    
    // When/Then: Invalid email format
    expect(result.current.validateEmail('invalid-email')).toBe(false);
  });

  it('should submit email to waitlist and update state accordingly', async () => {
    // Given: Hook is rendered with a valid email
    const { result, waitForNextUpdate } = renderHook(() => useWaitlist(), { wrapper });
    
    // When: Setting email and submitting
    act(() => {
      result.current.setEmail(testEmail);
    });
    
    // Then: Submit the email
    let submitResult: boolean | undefined;
    await act(async () => {
      submitResult = await result.current.submitToWaitlist();
      // Wait for state updates to complete
      await waitForNextUpdate();
    });
    
    // Then: Submission should succeed
    expect(submitResult).toBe(true);
    
    // And: State should be updated
    expect(result.current.isRegistered).toBe(true);
    expect(result.current.registeredEmail).toBe(testEmail);
    expect(result.current.isLoading).toBe(false);
  });
}); 