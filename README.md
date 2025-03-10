# Nummus Wallet

[![Discord](https://img.shields.io/discord/1328209986324660264?color=7289DA&label=Discord&logo=discord&logoColor=white)](https://discord.gg/ESu8yjhuGn)
[![Twitch Status](https://img.shields.io/twitch/status/tristanBietsch?style=social)](https://www.twitch.tv/tristanBietsch)
[![YouTube Channel](https://img.shields.io/youtube/channel/subscribers/UCV1axOOfemDa1PI-WgRkj7Q?style=social)](https://www.youtube.com/@TristanBietsch)
[![Twitter Follow](https://img.shields.io/twitter/follow/NummusBTC?style=social)](https://twitter.com/NummusBTC)
[![License](https://img.shields.io/github/license/NummusBTC/nummus-wallet)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/NummusBTC/nummus-wallet)
[![GitHub issues](https://img.shields.io/github/issues/NummusBTC/nummus-wallet)](https://github.com/NummusBTC/nummus-wallet/issues)
[![GitHub stars](https://img.shields.io/github/stars/NummusBTC/nummus-wallet)](https://github.com/NummusBTC/nummus-wallet/stargazers)

Nummus is a non-custodial Bitcoin wallet focused on providing users with full control over their Bitcoin transactions on the base layer. Our primary goal is to create a secure, user-friendly, and fully non-custodial wallet for managing Bitcoin.

## Features

- Bitcoin transaction management
- Secure non-custodial architecture
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
- **Bitcoin Development Kit (BDK)** - For Bitcoin wallet functionality
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
git clone https://github.com/nummusBtc/nummus-wallet.git
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


## Contact

- Twitter: [@NummusBTC](https://twitter.com/NummusBTC)
- Twitch: [tristanBietsch](https://www.twitch.tv/tristanBietsch)
- YouTube: [Tristan Bietsch](https://www.youtube.com/@TristanBietsch)