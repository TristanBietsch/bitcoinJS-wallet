// Mock the expo modules
jest.mock('expo-font', () => ({
  useFonts: () => [true]
}));

jest.mock('expo-image', () => ({
  Image: 'Image'
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    navigate: jest.fn(),
    push: jest.fn()
  }),
  usePathname: () => '/',
  Link: 'Link'
}));

// Mock the gluestack-ui toast
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    show: jest.fn()
  }),
  Toast: ({ children }) => children,
  ToastTitle: ({ children }) => children,
  ToastDescription: ({ children }) => children
}));

// Mock the useWaitlist hook
jest.mock('@/hooks/useWaitlist', () => ({
  useWaitlist: jest.fn().mockReturnValue({
    email: '',
    setEmail: jest.fn(),
    isLoading: false,
    isRegistered: false,
    registeredEmail: undefined,
    submitToWaitlist: jest.fn(),
    validateEmail: jest.fn().mockReturnValue(true)
  })
}));

// Mock components to avoid native dependencies
jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children, style, type }) => children
}));

jest.mock('@/components/ThemedView', () => ({
  ThemedView: ({ children, style }) => children
}));

jest.mock('@/components/domain/Card/FeatureChips', () => ({
  FeatureChips: () => 'FeatureChips'
}));

// Mock the colorScheme hook
jest.mock('@/hooks/useColorScheme', () => ({
  __esModule: true,
  default: () => 'light'
}));

// Mock the constants
jest.mock('@/constants/Colors', () => ({
  light: {
    text: '#000',
    background: '#fff',
    tint: '#2196F3',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2196F3',
    subtleBorder: '#E0E0E0',
    errorRed: '#FF3B30',
    inactiveGray: '#8E8E93',
    successGreen: '#34C759',
    icon: '#8E8E93'
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#2196F3',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2196F3',
    subtleBorder: '#272729',
    errorRed: '#FF453A',
    inactiveGray: '#8E8E93',
    successGreen: '#30D158',
    icon: '#8E8E93'
  }
}));

// Mock other modules as needed
jest.mock('lucide-react-native', () => ({
  ArrowRight: 'ArrowRight',
  CreditCard: 'CreditCard',
  Home: 'Home',
  Bitcoin: 'Bitcoin',
  Clock: 'Clock'
}));

// Mock React Native components
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return {
    ...ReactNative,
    ActivityIndicator: 'ActivityIndicator',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    View: 'View',
    Text: 'Text',
    StyleSheet: {
      create: styles => styles,
      hairlineWidth: 1
    },
    Platform: {
      ...ReactNative.Platform,
      OS: 'ios',
      select: jest.fn().mockImplementation(obj => obj.ios || obj.default)
    }
  };
}); 