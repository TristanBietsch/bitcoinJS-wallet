"use client"

import React, { forwardRef } from "react"
import { createToastHook } from "@gluestack-ui/toast"
import { AccessibilityInfo, Text, View, TextStyle, ViewStyle } from "react-native"
import { Motion, AnimatePresence } from "@legendapp/motion"

// Create the toast hook
const useToast = createToastHook(Motion.View, AnimatePresence)

// Toast component props
interface ToastProps {
  variant?: 'solid' | 'outline';
  action?: 'error' | 'warning' | 'success' | 'info' | 'muted';
  children?: React.ReactNode;
  style?: ViewStyle;
  [x: string]: any;
}

// Toast component
const Toast = forwardRef<View, ToastProps>(
  ({ variant = "solid", action = "muted", children, style, ...props }, ref) => {
    const baseStyles: ViewStyle = {
      padding: 16,
      marginVertical: 4,
      marginHorizontal: 4,
      borderRadius: 8,
      gap: 4,
      backgroundColor: action === 'error' ? '#EF4444' : action === 'success' ? '#10B981' : '#262626',
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }

    return (
      <Motion.View
        ref={ref as any}
        style={[baseStyles, style]}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'timing', duration: 300 }}
        {...props}
      >
        {children}
      </Motion.View>
    )
  }
)

// Toast Title component props
interface ToastTitleProps {
  children?: React.ReactNode;
  style?: TextStyle;
  [x: string]: any;
}

// Toast Title component
const ToastTitle = forwardRef<Text, ToastTitleProps>(({ children, style, ...props }, ref) => {
  React.useEffect(() => {
    // Announce to screen readers
    if (typeof children === 'string') {
      AccessibilityInfo.announceForAccessibility(children);
    }
  }, [children])

  const baseStyles: TextStyle = {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  }

  return (
    <Text
      {...props}
      ref={ref as any}
      aria-live="assertive"
      aria-atomic="true"
      role="alert"
      style={[baseStyles, style]}
    >
      {children}
    </Text>
  )
})

// Toast Description component props
interface ToastDescriptionProps {
  children?: React.ReactNode;
  style?: TextStyle;
  [x: string]: any;
}

// Toast Description component
const ToastDescription = forwardRef<Text, ToastDescriptionProps>(
  ({ children, style, ...props }, ref) => {
    const baseStyles: TextStyle = {
      color: '#FFFFFF',
      fontSize: 14,
    }

    return (
      <Text
        ref={ref as any}
        {...props}
        style={[baseStyles, style]}
      >
        {children}
      </Text>
    )
  }
)

// Set display names for better debugging
Toast.displayName = 'Toast';
ToastTitle.displayName = 'ToastTitle';
ToastDescription.displayName = 'ToastDescription';

export { useToast, Toast, ToastTitle, ToastDescription } 