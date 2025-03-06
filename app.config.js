// Load environment variables from tests/.env.test file
require('dotenv').config({ path: './tests/.env.test' });
console.log('Loading environment variables from tests/.env.test for Expo config');

module.exports = {
  name: "Nummus Wallet",
  slug: "nummus-wallet",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  },
  web: {
    bundler: "metro",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-splash-screen",
    "expo-font"
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    // Expose environment variables to the app
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    nodeEnv: process.env.NODE_ENV
  }
}; 