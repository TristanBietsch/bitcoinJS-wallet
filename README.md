# Nummus Wallet

[![Discord](https://img.shields.io/discord/1234567890?color=7289DA&label=Discord&logo=discord&logoColor=white)](https://discord.gg/ESu8yjhuGn)
[![Twitch Status](https://img.shields.io/twitch/status/tristanBietsch?style=social)](https://www.twitch.tv/tristanBietsch)
[![YouTube Channel](https://img.shields.io/youtube/channel/subscribers/UC_placeholder?style=social)](https://www.youtube.com/@TristanBietsch)
[![Twitter Follow](https://img.shields.io/twitter/follow/NummusBTC?style=social)](https://twitter.com/NummusBTC)
<!-- [![Version](https://img.shields.io/github/v/release/nummus/nummus-wallet?include_prereleases)](https://github.com/nummus/nummus-wallet/releases) -->
[![License](https://img.shields.io/github/license/nummus/nummus-wallet)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/nummus/nummus-wallet)

Nummus is a modern, secure Bitcoin wallet with Lightning Network support, designed to make Bitcoin transactions simple and accessible for everyone.

## Features

- Bitcoin transaction management
- Lightning Network integration
- Real-time price tracking
- Secure wallet creation and backup
- Transaction history
- QR code sending and receiving
- Fee estimation
- Biometric authentication

## Tech Stack

Nummus is built using the following technologies:

- **React Native** - Cross-platform mobile app framework
- **Expo** - React Native development platform
- **TypeScript** - Statically typed JavaScript
- **NativeWind/Tailwind CSS** - Utility-first CSS framework
- **Gluestack UI** - UI component library
- **Supabase** - Backend as a service platform
- **Mempool.space API** - Bitcoin mempool data and fee estimation
- **LND** - An SDK for integrating Lightning Network functionality
- **Secure storage** - For sensitive wallet data
- **Jest** - Testing framework

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```
git clone https://github.com/nummus/nummus-wallet.git
cd nummus-wallet
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

## Usage

[Include basic usage instructions here]

## Testing

Our project uses Jest as the testing framework. You can run tests using the following commands:

```bash
# Run tests in watch mode (default)
npm test

# or with yarn
yarn test
```

The test files are located in the `/tests` directory and use the `.test.tsx` extension. We utilize the following testing tools:

- Jest with jest-expo preset
- @testing-library/react-native for component testing
- @testing-library/react-hooks for testing hooks

When adding new features, please ensure you include appropriate tests to maintain code quality.

## Contributing

We welcome contributions to Nummus Wallet! Please read our contribution guidelines before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Twitter: [@NummusBTC](https://twitter.com/NummusBTC)
- Discord: [Join our community](https://discord.gg/nummus)
- Twitch: [tristanBietsch](https://www.twitch.tv/tristanBietsch)
- YouTube: [Tristan Bietsch](https://www.youtube.com/@TristanBietsch)