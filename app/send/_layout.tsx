import React from 'react'
import { Stack } from 'expo-router'

export default function SendLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown : false,
        animation   : 'slide_from_right'
      }}
    />
  )
} 