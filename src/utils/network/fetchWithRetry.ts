import axios, { AxiosRequestConfig, AxiosError } from 'axios'

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_INITIAL_DELAY_MS = 1000
const DEFAULT_TIMEOUT_MS = 15000 

interface FetchErrorData {
  status?: number;
  message: string;
  isNetworkError?: boolean;
}

export class FetchRetryError extends Error {
  public data: FetchErrorData

  constructor(message: string, data: FetchErrorData) {
    super(message)
    this.name = 'FetchRetryError'
    this.data = data
    Object.setPrototypeOf(this, FetchRetryError.prototype)
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function fetchWithRetry<T>(
  url: string,
  axiosConfig: AxiosRequestConfig = {},
  maxRetries: number = DEFAULT_MAX_RETRIES,
  initialDelayMs: number = DEFAULT_INITIAL_DELAY_MS
): Promise<T> {
  let attempts = 0
  let currentDelay = initialDelayMs

  const configWithTimeout: AxiosRequestConfig = {
    ...axiosConfig,
    timeout : axiosConfig.timeout || DEFAULT_TIMEOUT_MS,
  }

  while (attempts < maxRetries) {
    try {
      const response = await axios(url, configWithTimeout)
      return response.data as T
    } catch (error) {
      attempts++
      const axiosError = error as AxiosError

      let errorData: FetchErrorData = {
        message        : axiosError.message || 'An unknown error occurred',
        status         : axiosError.response?.status,
        isNetworkError : axiosError.isAxiosError && !axiosError.response, 
      }

      if (attempts >= maxRetries || (axiosError.response && axiosError.response.status < 500 && axiosError.response.status >= 400 && axiosError.response.status !== 429) ) {
        console.error(
          `Final attempt failed for ${url}. Attempts: ${attempts}. Error: ${axiosError.message}`, 
          axiosError.response?.data
        )
        throw new FetchRetryError(
          `API Error: ${errorData.message} (Status: ${errorData.status || 'N/A'})${errorData.isNetworkError ? ' - Network Error' : ''}`,
          errorData
        )
      }

      console.warn(
        `Attempt ${attempts} failed for ${url}. Retrying in ${currentDelay}ms. Error: ${axiosError.message}`
      )
      await delay(currentDelay)
      currentDelay *= 2 
    }
  }
  throw new FetchRetryError('Max retries reached without success.', {
    message : 'Max retries reached',
  })
} 