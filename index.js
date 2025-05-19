// First initialize the TextEncoder/TextDecoder polyfill
import 'text-encoding';

// Import and initialize crypto polyfills
import 'react-native-get-random-values';

// Import URL polyfill
import 'react-native-url-polyfill/auto';

// Import base64 polyfill
import base64 from 'base-64';
if (!global.btoa) {
  global.btoa = base64.encode;
}
if (!global.atob) {
  global.atob = base64.decode;
}

// Properly setup Buffer with encoding support
import { Buffer } from 'buffer';

// Add missing Buffer encodings
const originalFrom = Buffer.from;
Buffer.from = function(data, encoding) {
  if (encoding === 'ascii') {
    encoding = 'utf8'; // Replace ascii with utf8
  }
  return originalFrom.call(this, data, encoding);
};

global.Buffer = Buffer;

// Explicitly import React and make it global
import React from 'react';

// Ensure React is in global scope
global.React = React;

// Disable WASM for tiny-secp256k1
globalThis.__tinysecp256k1_useWasm = false;

// Initialize React Native
import 'react-native';

// Import the crypto config
import { initCryptoConfig } from './src/services/bitcoin/config/cryptoConfig';
initCryptoConfig();

// Import the main app entry
import 'expo-router/entry'; 