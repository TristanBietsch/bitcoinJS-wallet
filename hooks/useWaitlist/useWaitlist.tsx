import React from 'react';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/api/supabaseService';
import { resendService } from '@/services/api/resendService';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for waitlist status
const WAITLIST_STORAGE_KEY = 'nummus_card_waitlist_status';

// Schema for waitlist status
const WaitlistStatusSchema = z.object({
  isRegistered: z.boolean(),
  email: z.string().email().optional(),
  registeredAt: z.string().optional(),
});

type WaitlistStatus = z.infer<typeof WaitlistStatusSchema>;

export interface WaitlistHook {
  email: string;
  setEmail: (value: string) => void;
  isLoading: boolean;
  isRegistered: boolean;
  registeredEmail?: string;
  submitToWaitlist: () => Promise<boolean>;
  validateEmail: (email: string) => boolean;
}

// Storage service that uses AsyncStorage
const storage = {
  async get<T>(key: string, schema?: z.ZodType<T>): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      
      const parsedValue = JSON.parse(value) as T;
      
      // Validate with schema if provided
      if (schema) {
        return schema.parse(parsedValue);
      }
      
      return parsedValue;
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error);
      return null;
    }
  },
  
  async set<T>(key: string, value: T, schema?: z.ZodType<T>): Promise<boolean> {
    try {
      // Validate with schema if provided
      if (schema) {
        schema.parse(value);
      }
      
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
      return false;
    }
  }
};

export const useWaitlist = (): WaitlistHook => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | undefined>(undefined);
  const toast = useToast();

  // Load waitlist status from storage on mount
  useEffect(() => {
    const loadWaitlistStatus = async () => {
      const storedStatus = await storage.get<WaitlistStatus>(
        WAITLIST_STORAGE_KEY,
        WaitlistStatusSchema
      );
      
      if (storedStatus) {
        setIsRegistered(storedStatus.isRegistered);
        if (storedStatus.email) {
          setRegisteredEmail(storedStatus.email);
        }
      }
    };
    
    loadWaitlistStatus();
  }, []);

  // Save waitlist status to storage
  const saveWaitlistStatus = async (status: WaitlistStatus) => {
    await storage.set(WAITLIST_STORAGE_KEY, status, WaitlistStatusSchema);
  };

  // Handle email input change
  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    try {
      z.string().email().parse(email);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Submit email to waitlist
  const submitToWaitlist = async (): Promise<boolean> => {
    if (!validateEmail(email)) {
      toast.show({
        render: ({ id }) => (
          <Toast action="error">
            <ToastTitle>Invalid Email</ToastTitle>
            <ToastDescription>Please enter a valid email address.</ToastDescription>
          </Toast>
        ),
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Add to Supabase waitlist
      const { success, error } = await supabaseService.addToWaitlist(email);
      
      if (!success) {
        toast.show({
          render: ({ id }) => (
            <Toast action="error">
              <ToastTitle>Error</ToastTitle>
              <ToastDescription>{error || 'Failed to join waitlist'}</ToastDescription>
            </Toast>
          ),
        });
        setIsLoading(false);
        return false;
      }

      // Send confirmation email
      const emailResult = await resendService.sendWaitlistConfirmation(email);
      
      if (!emailResult.success) {
        console.error('Failed to send confirmation email:', emailResult.error);
        // We don't show an error toast here since the user is already added to the waitlist
      }

      // Update state and save to storage
      setIsRegistered(true);
      setRegisteredEmail(email);
      await saveWaitlistStatus({
        isRegistered: true,
        email,
        registeredAt: new Date().toISOString(),
      });

      // Show success toast
      toast.show({
        render: ({ id }) => (
          <Toast action="success">
            <ToastTitle>Success!</ToastTitle>
            <ToastDescription>You've been added to the waitlist.</ToastDescription>
          </Toast>
        ),
      });

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Waitlist submission error:', error);
      
      toast.show({
        render: ({ id }) => (
          <Toast action="error">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>An unexpected error occurred. Please try again.</ToastDescription>
          </Toast>
        ),
      });
      
      setIsLoading(false);
      return false;
    }
  };

  return {
    email,
    setEmail: handleEmailChange,
    isLoading,
    isRegistered,
    registeredEmail,
    submitToWaitlist,
    validateEmail,
  };
}; 