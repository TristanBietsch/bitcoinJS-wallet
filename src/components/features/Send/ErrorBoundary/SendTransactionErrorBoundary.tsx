/**
 * Error Boundary for Send Transaction Flow
 * Catches and handles unexpected errors during the send process
 */

import React, { Component, ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import ActionButtonGroup from '@/src/components/ui/Button/ActionButtonGroup'
import { router } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import logger from '@/src/utils/logger'

interface SendTransactionErrorBoundaryProps {
  children: ReactNode
  fallbackMessage?: string
  onRetry?: () => void
  onNavigateHome?: () => void
}

interface SendTransactionErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

/**
 * Error boundary specifically designed for the Send transaction flow
 * Provides graceful error handling and recovery options
 */
export class SendTransactionErrorBoundary extends Component<
  SendTransactionErrorBoundaryProps,
  SendTransactionErrorBoundaryState
> {
  constructor(props: SendTransactionErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): SendTransactionErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error for debugging
    logger.error('SendTransactionErrorBoundary', 'Unexpected error in send flow', {
      error          : error.message,
      stack          : error.stack,
      componentStack : errorInfo.componentStack
    })

    this.setState({
      hasError : true,
      error,
      errorInfo
    })

    // Reset send store to prevent stuck states
    try {
      useSendStore.getState().reset()
    } catch (resetError) {
      logger.error('SendTransactionErrorBoundary', 'Failed to reset send store', resetError)
    }
  }

  handleRetry = () => {
    // Reset error state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    
    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry()
    } else {
      // Default retry: navigate back to address screen
      router.replace('/send/address' as any)
    }
  }

  handleNavigateHome = () => {
    // Reset error state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    
    // Call custom navigation handler if provided
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome()
    } else {
      // Default: navigate to home
      router.replace('/' as any)
    }
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.props.fallbackMessage || 
        'An unexpected error occurred during the transaction process. Your funds are safe.'

      return (
        <StatusScreenLayout>
          <View style={styles.container}>
            {/* Error Icon */}
            <StatusIcon type="error" size={80} />

            {/* Error Message */}
            <MessageDisplay
              title="Transaction Error"
              subtitle={errorMessage}
            />

            {/* Development Error Details (only in dev mode) */}
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <MessageDisplay
                  title="Debug Info"
                  subtitle={`${this.state.error.name}: ${this.state.error.message}`}
                />
              </View>
            )}

            {/* Action Buttons */}
            <ActionButtonGroup
              primaryText="Try Again"
              secondaryText="Go Home"
              onPrimaryPress={this.handleRetry}
              onSecondaryPress={this.handleNavigateHome}
            />
          </View>
        </StatusScreenLayout>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container : {
    flex              : 1,
    justifyContent    : 'center',
    alignItems        : 'center',
    paddingHorizontal : 20
  },
  debugContainer : {
    marginTop       : 20,
    padding         : 15,
    backgroundColor : '#f5f5f5',
    borderRadius    : 8,
    opacity         : 0.8
  }
})

/**
 * HOC version of the error boundary for easier integration
 */
export const withSendTransactionErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  const WrappedComponent = (props: P) => (
    <SendTransactionErrorBoundary>
      <Component {...props} />
    </SendTransactionErrorBoundary>
  )
  
  WrappedComponent.displayName = `withSendTransactionErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
} 