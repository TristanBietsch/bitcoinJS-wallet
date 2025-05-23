import axios from 'axios'
import { z } from 'zod'
import Constants from 'expo-constants'
import logger, { LogScope } from '@/src/utils/logger'

// Schema for validating email
export const EmailSchema = z.string().email('Invalid email format')

// Schema for email testing entry
export const WaitlistEntrySchema = z.object({
  email     : EmailSchema,
  createdAt : z.date().optional(),
})

export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;

// Common types
interface WaitlistResponse {
  success: boolean;
  error?: string;
}

interface CheckWaitlistResponse {
  exists: boolean;
  error?: string;
}

/**
 * Mock Supabase Service for testing
 * This implementation stores waitlist emails in memory for testing
 */
class MockSupabaseService {
  private waitlistEmails: Set<string> = new Set()

  constructor() {
    logger.init('Mock Supabase Service initialized for testing')
  }

  /**
   * Validate email format using a simple regex
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Add an email to the waitlist
   */
  async addToWaitlist(email: string): Promise<WaitlistResponse> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      logger.warn(LogScope.STORAGE, `[MOCK] Invalid email format: ${email}`)
      return { success: false, error: 'Invalid email format' }
    }

    // Check if email already exists
    if (this.waitlistEmails.has(email)) {
      logger.warn(LogScope.STORAGE, `[MOCK] Email already registered: ${email}`)
      return { success: false, error: 'Email already registered' }
    }

    // Add email to waitlist
    this.waitlistEmails.add(email)
    logger.debug(LogScope.STORAGE, `[MOCK] Added email to waitlist: ${email}`)
    return { success: true }
  }

  /**
   * Check if an email is in the waitlist
   */
  async checkWaitlist(email: string): Promise<CheckWaitlistResponse> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      return { exists: false, error: 'Invalid email format' }
    }

    // Check if email exists
    const exists = this.waitlistEmails.has(email)
    logger.debug(LogScope.STORAGE, `[MOCK] Checked waitlist for email: ${email} Exists: ${exists}`)
    return { exists }
  }
}

/**
 * Real Supabase Service for production
 */
class SupabaseService {
  private apiUrl: string
  private apiKey: string
  private tableName: string = 'email-testing'
  private mockService: MockSupabaseService
  private useRealService: boolean

  constructor() {
    // Load environment variables from expo-constants (populated from app.config.js)
    const extra = Constants.expoConfig?.extra || {}
    this.apiUrl = extra.supabaseUrl || ''
    this.apiKey = extra.supabaseKey || ''
    
    this.mockService = new MockSupabaseService()
    
    // Always use the real service for email-testing if we have credentials
    this.useRealService = !!(this.apiUrl && this.apiKey)
    
    logger.init('Supabase Service initialized')
    logger.init(`- API URL: ${this.apiUrl ? 'Set' : 'Not set'}`)
    logger.init(`- API Key: ${this.apiKey ? 'Set' : 'Not set'}`)
    logger.init(`- Table: ${this.tableName}`)
    logger.init(`- Environment: ${extra.nodeEnv || 'development'}`)
    logger.init(`- Using: ${this.useRealService ? 'Real Supabase API' : 'Mock Service with email-testing table'}`)
  }

  /**
   * Add an email to the waitlist
   */
  async addToWaitlist(email: string): Promise<WaitlistResponse> {
    // Validate email format using a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      logger.warn(LogScope.API, `Invalid email format: ${email}`)
      return { success: false, error: 'Invalid email format' }
    }

    // Use mock service if we don't have API credentials
    if (!this.useRealService) {
      return this.mockService.addToWaitlist(email)
    }

    logger.debug(LogScope.API, `Adding email to waitlist: ${email}`)
    try {
      // First check if the email already exists
      const checkResult = await this.checkWaitlist(email)
      if (checkResult.exists) {
        logger.warn(LogScope.API, `Email already registered: ${email}`)
        return { success: false, error: 'Email already registered' }
      }

      // Add email to waitlist with current timestamp
      logger.debug(LogScope.API, `API call to add email: ${email}`)
      const _response = await axios.post(
        `${this.apiUrl}/rest/v1/${this.tableName}`,
        { 
          email,
          created_at : new Date().toISOString() 
        },
        {
          headers : {
            'apikey'        : this.apiKey,
            'Authorization' : `Bearer ${this.apiKey}`,
            'Content-Type'  : 'application/json',
            'Prefer'        : 'return=minimal'
          },
          timeout : 10000 // 10 second timeout
        }
      )

      logger.debug(LogScope.API, `Successfully added email to waitlist: ${email}`)
      return { success: true }
    } catch (error: any) {
      // Handle different types of errors
      logger.error(LogScope.API, `Error adding email to waitlist: ${error.message}`)
      
      if (error.response) {
        logger.error(LogScope.API, `API Error: ${error.response.status}`, error.response.data)
        
        // Handle specific error cases
        if (error.response.status === 409) {
          return { success: false, error: 'Email already registered' }
        }
      }
      
      // Don't fall back to mock service - return the actual error
      return { 
        success : false, 
        error   : error.response?.data?.message || error.message || 'Failed to add email to waitlist'
      }
    }
  }

  /**
   * Check if an email is in the waitlist
   */
  async checkWaitlist(email: string): Promise<CheckWaitlistResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { exists: false, error: 'Invalid email format' }
    }

    // Use mock service if we don't have API credentials
    if (!this.useRealService) {
      return this.mockService.checkWaitlist(email)
    }

    logger.debug(LogScope.API, `Checking if email exists in waitlist: ${email}`)
    try {
      // Query the waitlist table
      logger.debug(LogScope.API, `API call to check waitlist for email: ${email}`)
      const response = await axios.get(
        `${this.apiUrl}/rest/v1/${this.tableName}`,
        {
          headers : {
            'apikey'        : this.apiKey,
            'Authorization' : `Bearer ${this.apiKey}`
          },
          params : {
            email  : `eq.${email}`,
            select : 'email'
          },
          timeout : 10000 // 10 second timeout
        }
      )

      const exists = response.data.length > 0
      logger.debug(LogScope.API, `Email check result for ${email}: ${exists ? 'Exists' : 'Does not exist'}`)
      return { exists }
    } catch (error: any) {
      logger.error(LogScope.API, `Error checking waitlist: ${error.message}`)
      
      if (error.response) {
        logger.error(LogScope.API, `API Error: ${error.response.status}`, error.response.data)
      }
      
      // Don't fall back to mock service - return the actual error
      return { 
        exists : false, 
        error  : error.response?.data?.message || error.message || 'Failed to check waitlist'
      }
    }
  }
}

// Export as singleton
export const supabaseService = new SupabaseService() 