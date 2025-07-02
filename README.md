

[▶ Watch the demo on YouTube](https://www.youtube.com/watch?v=YURGi_GPb98&t=731s)
[▶ Watch the demo on YouTube](https://www.youtube.com/watch?v=YURGi_GPb98&t=731s)
[▶ Watch the demo on YouTube](https://www.youtube.com/watch?v=YURGi_GPb98&t=731s)
[▶ Watch the demo on YouTube](https://www.youtube.com/watch?v=YURGi_GPb98&t=731s)

# Bitcoin Wallet

A simple BitcoinJS wallet built with React Native and TypeScript.

**⚠️ ALPHA SOFTWARE - TESTNET ONLY**

This is alpha software under active development. Do not use with real Bitcoin on mainnet.

## Tech Stack

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type safety and developer experience  
- **BitcoinJS-lib** - Bitcoin protocol implementation
- **Expo** - Development platform and tooling
- **Zustand** - State management
- **React Query** - Data fetching and caching

## Features

- Non-custodial Bitcoin wallet
- Send and receive Bitcoin
- Transaction history
- QR code scanning
- Multi-network support (testnet/mainnet)
- BIP39 seed phrase generation and recovery

## Setup

### Prerequisites

- Node.js 18+
- Yarn or npm
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/TristanBietsch/bitcoinJS-wallet.git
cd bitcoinJS-wallet

# Install dependencies
yarn install

# Start development server
yarn start
```

### Run on Device

```bash
# iOS
yarn ios

# Android  
yarn android

# Or scan QR code with Expo Go app
```

## Configuration

The wallet defaults to Bitcoin testnet for safe development. To change networks:

```bash
# Set environment variable
export BITCOIN_NETWORK=testnet  # testnet | mainnet | regtest
```

Or create a `.env` file:

```bash
BITCOIN_NETWORK=testnet
```

## Testing

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run linting
yarn lint
```

## Development

```bash
# Start development server
yarn start

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android

# Run linting with auto-fix
yarn lint:fix
```

## Project Structure

```
app/                    # Expo Router pages
src/
  ├── components/       # Reusable UI components
  ├── services/         # Bitcoin and API services
  ├── hooks/           # Custom React hooks
  ├── store/           # State management
  ├── utils/           # Utility functions
  └── types/           # TypeScript type definitions
```

## Security

- Private keys stored in device secure storage
- BIP39 mnemonic generation
- No private keys transmitted over network

## Contributing

This is alpha software. Contributions welcome but please note:

1. Test thoroughly on testnet
2. Follow existing code patterns
3. Add tests for new features
4. Run `yarn lint` before submitting

## Bug Reports

Report issues at: https://github.com/TristanBietsch/bitcoinJS-wallet/issues

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Disclaimer

This is alpha software. Use at your own risk. The authors are not responsible for any loss of funds. Always test thoroughly on testnet before using with real Bitcoin.
