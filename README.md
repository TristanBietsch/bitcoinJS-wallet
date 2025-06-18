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
- **NativeWind** - UI component library
- **Supabase** - Backend as a service platform
- **Mempool.space API** - Bitcoin mempool data and fee estimation
- **Bitcoin Development Kit (BDK)** - For Bitcoin wallet functionality
- **BitcoinJS** - For Bitcoin wallet functionality in JavaScript
- **Secure storage** - For sensitive wallet data
- **Jest** - Testing framework

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Bitcoin Core (for regtest development)

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

## Bitcoin Network Configuration

Nummus Wallet supports multiple Bitcoin networks for different development and deployment scenarios:

- **regtest**: Local development environment for testing (default)
- **testnet**: Bitcoin testnet for pre-production testing
- **mainnet**: Bitcoin mainnet for production use

### Switching Networks

To switch between networks, you can set the `BITCOIN_NETWORK` environment variable:

```bash
# For development on regtest (default)
BITCOIN_NETWORK=regtest npm start

# For testing on testnet
BITCOIN_NETWORK=testnet npm start

# For production on mainnet
BITCOIN_NETWORK=mainnet npm start
```

### Secure Configuration

For security reasons, RPC credentials should not be hardcoded. Use environment variables instead:

```bash
# For regtest
BITCOIN_REGTEST_HOST=localhost
BITCOIN_REGTEST_PORT=18443
BITCOIN_REGTEST_USERNAME=your_secure_username
BITCOIN_REGTEST_PASSWORD=your_secure_password

# For testnet
BITCOIN_TESTNET_HOST=your_testnet_node
BITCOIN_TESTNET_PORT=18332
BITCOIN_TESTNET_USERNAME=your_secure_username
BITCOIN_TESTNET_PASSWORD=your_secure_password
BITCOIN_TESTNET_PROTOCOL=https  # Always use HTTPS for non-local connections

# For mainnet (production)
BITCOIN_MAINNET_HOST=your_mainnet_node
BITCOIN_MAINNET_PORT=8332
BITCOIN_MAINNET_USERNAME=your_secure_username
BITCOIN_MAINNET_PASSWORD=your_secure_password
BITCOIN_MAINNET_PROTOCOL=https  # Always use HTTPS for production
```

You can set these in your environment or create a `.env` file (not committed to version control).

### Security Best Practices

When using this wallet in production:

1. **Always use HTTPS** for connections to remote Bitcoin nodes
2. **Never use default credentials** in production
3. **Validate all addresses** before sending transactions
4. **Keep private keys secure** and never expose them
5. **Consider using a hardware wallet** for large amounts

### Running a Local Bitcoin Node for Development

For development with regtest, you need to run a local Bitcoin Core node:

1. Install Bitcoin Core (https://bitcoin.org/en/download)

2. Create a bitcoin.conf file with regtest settings:

```
regtest=1
server=1
rpcuser=admin
rpcpassword=admin
rpcallowip=127.0.0.1
rpcport=18443
```

3. Start Bitcoin Core in regtest mode:

```bash
bitcoind -regtest -conf=/path/to/bitcoin.conf
```

4. Generate some initial blocks:

```bash
bitcoin-cli -regtest generatetoaddress 101 $(bitcoin-cli -regtest getnewaddress)
```

Now you can run the wallet with regtest mode and it will connect to your local Bitcoin Core node.

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


## Contact Me

- Twitter: [@NummusBTC](https://twitter.com/NummusBTC)
- Twitch: [tristanBietsch](https://www.twitch.tv/tristanBietsch)
- YouTube: [Tristan Bietsch](https://www.youtube.com/@TristanBietsch)