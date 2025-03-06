const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
  
const config = getDefaultConfig(__dirname);
  
// Add regenerator-runtime to the extraNodeModules
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    'regenerator-runtime': require.resolve('regenerator-runtime'),
  },
};

module.exports = withNativeWind(config, { input: './global.css' });