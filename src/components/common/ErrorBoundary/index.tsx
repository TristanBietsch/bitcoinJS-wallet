import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Heading, Text, Button } from "@gluestack-ui/themed"
import * as Sentry from 'sentry-expo'
import { useHaptics } from '@/src/hooks/useHaptics'

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches React errors
 * and reports them to Sentry for monitoring
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError : false,
      error    : null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError : true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report error to Sentry
    Sentry.Native.captureException(error, {
      extra : {
        componentStack : errorInfo.componentStack,
      },
    })
    
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  resetError = (): void => {
    // Trigger haptic feedback for UI action
    const { triggerNotification } = useHaptics()
    triggerNotification('success')
    
    this.setState({
      hasError : false,
      error    : null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box 
          flex={1} 
          alignItems="center" 
          justifyContent="center" 
          p="$4"
          bg="$background"
        >
          <Heading color="$error500" mb="$4">Something went wrong</Heading>
          <Text textAlign="center" mb="$6">
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <Button onPress={this.resetError}>
            <Button.Text>Try Again</Button.Text>
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 