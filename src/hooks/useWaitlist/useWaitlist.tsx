import { useState, useEffect } from 'react'
import { supabaseService } from '@/src/services/api/supabaseService'
import { useToast } from '@/src/components/ui/toast'
import { z } from 'zod'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Storage key for waitlist status
const WAITLIST_STORAGE_KEY = 'nummus_card_waitlist_status'

// Schema for waitlist status
const WaitlistStatusSchema = z.object({
  isRegistered : z.boolean(),
  email        : z.string().email().optional(),
  registeredAt : z.string().optional(),
})

type WaitlistStatus = z.infer<typeof WaitlistStatusSchema>;

export interface WaitlistHook {
  email: string;
  setEmail: (value: string) => void;
  isLoading: boolean;
  isRegistered: boolean;
  registeredEmail?: string;
  error?: string;
  submitToWaitlist: () => Promise<void>;
  validateEmail: (email: string) => boolean;
}

// Storage service that uses AsyncStorage
const storage = {
  async get<T>(key: string, schema?: z.ZodType<T>): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key)
      if (value === null) return null
      
      const parsedValue = JSON.parse(value) as T
      
      // Validate with schema if provided
      if (schema) {
        return schema.parse(parsedValue)
      }
      
      return parsedValue
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error)
      return null
    }
  },
  
  async set<T>(key: string, value: T, schema?: z.ZodType<T>): Promise<boolean> {
    try {
      // Validate with schema if provided
      if (schema) {
        schema.parse(value)
      }
      
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
      return true
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error)
      return false
    }
  }
}

export const useWaitlist = (): WaitlistHook => {
  const [ email, setEmail ] = useState('')
  const [ isLoading, setIsLoading ] = useState(false)
  const [ isRegistered, setIsRegistered ] = useState(false)
  const [ registeredEmail, setRegisteredEmail ] = useState<string | undefined>(undefined)
  const [ error, setError ] = useState<string | undefined>(undefined)
  const _toast = useToast()

  // Load waitlist status from storage on mount
  useEffect(() => {
    const loadWaitlistStatus = async () => {
      const storedStatus = await storage.get<WaitlistStatus>(
        WAITLIST_STORAGE_KEY,
        WaitlistStatusSchema
      )
      
      if (storedStatus) {
        setIsRegistered(storedStatus.isRegistered)
        if (storedStatus.email) {
          setRegisteredEmail(storedStatus.email)
        }
      }
    }
    
    loadWaitlistStatus()
  }, [])

  // Save waitlist status to storage
  const _saveWaitlistStatus = async (status: WaitlistStatus) => {
    await storage.set(WAITLIST_STORAGE_KEY, status, WaitlistStatusSchema)
  }

  // Handle email input change
  const handleEmailChange = (value: string) => {
    setEmail(value)
  }

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Submit email to waitlist
  const submitToWaitlist = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(undefined)

    try {
      // Add to waitlist
      const { success, error: waitlistError } = await supabaseService.addToWaitlist(email)
      
      if (!success) {
        if (waitlistError === 'Email already registered') {
          setIsRegistered(true)
          setRegisteredEmail(email)
        } else {
          setError(waitlistError || 'Failed to add to waitlist')
        }
        setIsLoading(false)
        return
      }
      
      // No need to send confirmation email - removed resendService code
      
      // Success
      setIsRegistered(true)
      setRegisteredEmail(email)
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Waitlist submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    setEmail : handleEmailChange,
    isLoading,
    isRegistered,
    registeredEmail,
    error,
    submitToWaitlist,
    validateEmail,
  }
} 