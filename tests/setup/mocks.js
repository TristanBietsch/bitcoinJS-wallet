/**
 * Centralized Jest mocks for common files and modules
 */

// Mock for React Native modules that might cause issues
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });
jest.mock('react-native-gesture-handler', () => ({}), { virtual: true });

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([]))
}), { virtual: true });

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: jest.fn(() => 'StatusBar')
}), { virtual: true });

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
  getStringAsync: jest.fn(() => Promise.resolve('')),
}), { virtual: true });

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve('')),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}), { virtual: true });

jest.mock('expo-file-system', () => ({
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  deleteAsync: jest.fn(() => Promise.resolve()),
  documentDirectory: 'file:///document/directory/',
  cacheDirectory: 'file:///cache/directory/',
}), { virtual: true });

// Mock lottie-react-native
jest.mock('lottie-react-native', () => 'LottieView', { virtual: true });

// Mock react-native-svg components
jest.mock('react-native-svg', () => {
  const MockSvg = () => 'Svg';
  MockSvg.Circle = () => 'Circle';
  MockSvg.Rect = () => 'Rect';
  MockSvg.Path = () => 'Path';
  MockSvg.G = () => 'G';
  return MockSvg;
}, { virtual: true });

// Mock react-native-qrcode-svg
jest.mock('react-native-qrcode-svg', () => 'QRCode', { virtual: true });

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  })),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: 'Link',
}), { virtual: true });