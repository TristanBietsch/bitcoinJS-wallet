import React from 'react';

// Set React globally 
if (typeof global.React === 'undefined') {
  global.React = React;
}

// This polyfill ensures React is available in the global scope
// which is needed for JSX to work properly
if (typeof window !== 'undefined' && !window.React) {
  window.React = React;
} 