import React from 'react';
import { TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export function ExternalLink({ href, children, ...props }: any) {
  return (
    <TouchableOpacity
      onPress={() => WebBrowser.openBrowserAsync(href)}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
} 