# Nummus Bitcoin Wallet 🪙

<div align="center">

**A non-custodial Bitcoin wallet for the mobile-first generation**

*Take full control of your Bitcoin with enterprise-grade security and an intuitive mobile experience*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](app.json)
[![Security](https://img.shields.io/badge/security-audit%20pending-orange.svg)](#security)

[**Quick Start**](#quick-start) • [**Features**](#features) • [**Security**](#security) • [**Documentation**](#documentation) • [**Community**](#community)

</div>

---

## 📱 About Nummus

Nummus is a **non-custodial Bitcoin wallet** that puts you in complete control of your Bitcoin. Built with React Native and TypeScript, it combines enterprise-grade security with an intuitive mobile experience, making Bitcoin accessible while never compromising on self-sovereignty.

### Why Nummus?

- 🔐 **Your keys, your Bitcoin** - Full non-custodial control
- 🚀 **Mobile-first design** - Optimized for everyday use
- 🛡️ **Security focused** - Built with Bitcoin security best practices
- 🌐 **Multi-network support** - Mainnet, Testnet, and Regtest
- ⚡ **Smart fee estimation** - Never overpay for transactions
- 🔒 **Biometric authentication** - Secure and convenient access

---

## ✨ Features

### Core Wallet Features
- **🪙 Bitcoin Transaction Management** - Send and receive Bitcoin securely
- **📊 Real-time Balance Tracking** - Live Bitcoin balance and price updates
- **📈 Transaction History** - Complete transaction history with detailed information
- **🎯 Smart Fee Estimation** - Dynamic fee calculation for optimal transaction speed

### Security & Privacy
- **🔐 Non-custodial Architecture** - You control your private keys
- **🛡️ Biometric Authentication** - Face ID / Touch ID / Fingerprint support
- **🔒 Secure Key Storage** - Hardware-backed key storage when available
- **🎭 Privacy Focused** - No account creation or personal information required

### User Experience
- **📷 QR Code Support** - Scan to send, generate to receive
- **💱 Multi-currency Display** - Bitcoin and fiat currency support
- **🌙 Dark Mode** - Beautiful UI with light and dark themes
- **📱 Cross-platform** - iOS and Android support

### Developer Features
- **🧪 Multi-network Support** - Mainnet, Testnet, and Regtest environments
- **🔧 Comprehensive Testing** - Unit and integration test coverage
- **📝 TypeScript** - Full type safety and developer experience
- **🎨 Component Library** - Reusable UI components

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **Yarn** or **npm** - Package manager
- **Expo CLI** - `npm install -g @expo/cli`
- **iOS Simulator** or **Android Emulator** - For development

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TristanBietsch/bitcoinJS-wallet.git
   cd nummus-wallet
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   yarn start
   # or
   npm start
   ```

5. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

### 5-Minute Setup Guide

Get up and running in 5 minutes:

1. **Install dependencies** (2 min)
2. **Configure Bitcoin network** - Default: Regtest for safe development (1 min)
3. **Start development server** (30 sec)
4. **Launch on simulator/device** (90 sec)

You're ready to develop! 🎉

---

## 🔧 Installation & Configuration

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Bitcoin Network Configuration
BITCOIN_NETWORK=regtest  # regtest | testnet | mainnet

# Regtest Configuration (for development)
BITCOIN_REGTEST_HOST=localhost
BITCOIN_REGTEST_PORT=18443
BITCOIN_REGTEST_USERNAME=your_username
BITCOIN_REGTEST_PASSWORD=your_password

# API Configuration
MEMPOOL_API_URL=https://mempool.space/api
PRICE_API_URL=https://api.coingecko.com/api/v3

# App Configuration
SENTRY_DSN=your_sentry_dsn  # Optional: Error tracking
```

### Bitcoin Network Support

Nummus supports multiple Bitcoin networks:

#### 🧪 Regtest (Development)
- **Purpose**: Local development and testing
- **Safety**: Completely isolated, no real Bitcoin
- **Setup**: Requires local Bitcoin Core node

#### 🚧 Testnet (Staging)
- **Purpose**: Pre-production testing with test Bitcoin
- **Safety**: Uses test Bitcoin (no monetary value)
- **Network**: Public Bitcoin testnet

#### 🟢 Mainnet (Production)
- **Purpose**: Production use with real Bitcoin
- **Safety**: ⚠️ Real Bitcoin - Use with caution
- **Network**: Bitcoin mainnet

### Development Environment Setup

For local development, you'll need a Bitcoin Core node running in regtest mode:

#### Option 1: Using Bitcoin Core

1. **Install Bitcoin Core**
   ```bash
   # macOS
   brew install bitcoin

   # Ubuntu
   sudo apt-get install bitcoin
   ```

2. **Create bitcoin.conf**
   ```ini
   # bitcoin.conf
   regtest=1
   server=1
   rpcuser=your_username
   rpcpassword=your_password
   rpcallowip=127.0.0.1
   rpcport=18443
   ```

3. **Start Bitcoin Core**
   ```bash
   bitcoind -regtest -conf=/path/to/bitcoin.conf
   ```

4. **Generate initial blocks**
   ```bash
   bitcoin-cli -regtest generatetoaddress 101 $(bitcoin-cli -regtest getnewaddress)
   ```

#### Option 2: Using Docker

```bash
# Run Bitcoin Core in regtest mode
docker run -d --name bitcoin-regtest \
  -p 18443:18443 \
  -e BITCOIN_NETWORK=regtest \
  ruimarinho/bitcoin-core:latest
```

---

## 🛡️ Security

Security is our top priority. Nummus implements multiple layers of protection:

### 🔐 Security Model

- **Non-custodial Design**: Private keys never leave your device
- **Hardware Security**: Utilizes iOS Secure Enclave and Android TEE when available
- **Biometric Authentication**: Face ID, Touch ID, and fingerprint support
- **Memory Protection**: Sensitive data cleared from memory after use
- **Network Security**: All external communications use HTTPS/TLS

### 🛡️ Key Management

- **Seed Phrase Generation**: Cryptographically secure random generation
- **BIP39 Compliance**: Standard 12/24 word mnemonic phrases
- **Key Derivation**: BIP32/BIP44 hierarchical deterministic wallets
- **Secure Storage**: Platform keychain integration (iOS Keychain, Android Keystore)

### ⚠️ Security Warnings

**🚨 Important Security Notices:**

1. **Testnet vs Mainnet**: Always verify you're on the correct network
2. **Seed Phrase Security**: Never share your seed phrase with anyone
3. **Screenshot Protection**: Seed phrases are protected from screenshots
4. **Development vs Production**: Never use development configurations in production

### 🔍 Security Audit

- **Status**: Security audit pending
- **Scope**: Smart contract-level security review planned
- **Bug Bounty**: Responsible disclosure program coming soon

### 📋 Responsible Disclosure

Found a security issue? We appreciate responsible disclosure:

- **Contact**: [security@nummus.btc](mailto:security@nummus.btc)
- **PGP Key**: [Download our PGP key](docs/security/pgp-key.asc)
- **Response Time**: 24-48 hours for initial response
- **Reward Program**: Bug bounty program details coming soon

---

## 🌐 Network Configuration

### Mainnet Configuration

```bash
# Production environment
BITCOIN_NETWORK=mainnet
BITCOIN_MAINNET_HOST=your-bitcoin-node.com
BITCOIN_MAINNET_PORT=8332
BITCOIN_MAINNET_USERNAME=secure_username
BITCOIN_MAINNET_PASSWORD=secure_password
BITCOIN_MAINNET_PROTOCOL=https
```

### Testnet Configuration

```bash
# Testing environment
BITCOIN_NETWORK=testnet
BITCOIN_TESTNET_HOST=your-testnet-node.com
BITCOIN_TESTNET_PORT=18332
BITCOIN_TESTNET_USERNAME=secure_username
BITCOIN_TESTNET_PASSWORD=secure_password
BITCOIN_TESTNET_PROTOCOL=https
```

### Security Best Practices

1. **Always use HTTPS** for remote Bitcoin node connections
2. **Never use default credentials** in production
3. **Regularly rotate RPC credentials**
4. **Use firewall rules** to restrict RPC access
5. **Monitor node access logs**

---

## 📖 API Documentation

### Core APIs

Nummus integrates with several APIs to provide comprehensive Bitcoin functionality:

#### Bitcoin Node RPC
- **Purpose**: Direct Bitcoin network interaction
- **Methods**: Transaction broadcast, UTXO management, fee estimation
- **Documentation**: [Bitcoin RPC Documentation](docs/API.md#bitcoin-rpc)

#### Mempool.space API
- **Purpose**: Transaction data and fee estimation
- **Endpoints**: `/api/v1/fees/recommended`, `/api/tx/{txid}`
- **Documentation**: [Mempool API Reference](https://mempool.space/docs/api)

#### Price APIs
- **Primary**: CoinGecko API for Bitcoin price data
- **Fallback**: Multiple price sources for reliability
- **Documentation**: [Price API Documentation](docs/API.md#price-apis)

### Internal APIs

For detailed API documentation, see [docs/API.md](docs/API.md).

---

## 🧪 Testing

Nummus has comprehensive test coverage across all critical components:

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run specific test
yarn test:single src/services/bitcoin/wallet.test.ts
```

### Test Categories

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Service and API integration testing
- **Security Tests**: Cryptographic function validation
- **UI Tests**: React Native component testing

### Testing Strategy

Our testing approach follows industry best practices:

1. **Test-Driven Development** for critical components
2. **Mock external dependencies** for reliable testing
3. **Test Bitcoin functionality** against regtest network
4. **Security-focused testing** for cryptographic operations

For detailed testing information, see [docs/TESTING.md](docs/TESTING.md).

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how to get started:

### Quick Contribution Guide

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with tests
4. **Run tests**: `yarn test`
5. **Submit a pull request**

### Development Guidelines

- **Code Style**: We use ESLint and Prettier for consistent formatting
- **Commits**: Follow [Conventional Commits](https://conventionalcommits.org/) specification
- **Testing**: All new features require tests
- **Security**: Security-related changes require extra review

### Areas We Need Help

- 🐛 Bug fixes and testing
- 📱 UI/UX improvements
- 🌐 Internationalization (i18n)
- 📖 Documentation improvements
- 🔒 Security auditing
- ⚡ Performance optimizations

For detailed contribution guidelines, see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use allowed
- ✅ Modification allowed  
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No warranty provided
- ❌ No liability assumed

---

## 🆘 Support & Community

### Getting Help

- 📖 **Documentation**: [docs/](docs/) directory
- 🐛 **Issues**: [GitHub Issues](https://github.com/TristanBietsch/bitcoinJS-wallet/issues)
- 💬 **Discord**: [Join our Discord](https://discord.gg/ESu8yjhuGn)
- 📧 **Email**: [support@nummus.btc](mailto:support@nummus.btc)

### Community Links

- **Discord**: [Nummus Community](https://discord.gg/ESu8yjhuGn) - General discussion and support
- **Twitter**: [@NummusBTC](https://twitter.com/NummusBTC) - Updates and announcements
- **YouTube**: [Tristan Bietsch](https://www.youtube.com/@TristanBietsch) - Development videos
- **Twitch**: [tristanBietsch](https://www.twitch.tv/tristanBietsch) - Live development streams

### 📞 Contact Information

- **Developer**: Tristan Bietsch
- **Project Website**: [nummus.btc](https://nummus.btc)
- **Business Inquiries**: [business@nummus.btc](mailto:business@nummus.btc)
- **Security Issues**: [security@nummus.btc](mailto:security@nummus.btc)

---

## 🗺️ Roadmap

### 🎯 Current Focus (v1.0)
- ✅ Core wallet functionality
- ✅ Multi-network support  
- ✅ Biometric authentication
- 🚧 Security audit completion
- 🚧 App store deployment

### 🔮 Future Features (v1.1+)
- 🔄 **Lightning Network**: Lightning payment support
- 🌍 **Multi-language**: Internationalization support
- 🔗 **Hardware Wallets**: Hardware wallet integration
- 📊 **Advanced Analytics**: Portfolio tracking and insights
- 🎨 **Custom Themes**: User-customizable themes
- 🔧 **Plugin System**: Extensible functionality

### 📈 Long-term Vision
- Become the leading mobile Bitcoin wallet for sovereignty-focused users
- Educational platform for Bitcoin best practices
- Integration with broader Bitcoin ecosystem

---

## 🏗️ Architecture

### Tech Stack Overview

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React Native + TypeScript | Cross-platform mobile development |
| **State Management** | Zustand | Lightweight state management |
| **UI Framework** | NativeWind (Tailwind CSS) | Utility-first styling |
| **Navigation** | Expo Router | File-based routing |
| **Bitcoin Libraries** | BitcoinJS-lib, BIP39, BIP32 | Bitcoin protocol implementation |
| **Security** | Expo SecureStore, Biometrics | Secure storage and authentication |
| **Testing** | Jest, React Native Testing Library | Comprehensive testing suite |
| **Development** | Expo, Metro | Development and build tools |

### Key Design Principles

1. **Security First**: Every decision prioritizes user security
2. **Self-Sovereignty**: Users maintain complete control
3. **Simplicity**: Complex Bitcoin operations made simple
4. **Performance**: Optimized for mobile devices
5. **Reliability**: Robust error handling and recovery

---

## 📊 Project Status

### Current State
- **Version**: 1.0.0 (MVP)
- **Platform Support**: iOS, Android
- **Network Support**: Mainnet, Testnet, Regtest
- **Test Coverage**: 85%+ for critical paths
- **Security Audit**: Pending

### Recent Updates
- ✅ Seed phrase verification flow
- ✅ Biometric authentication
- ✅ Multi-network configuration
- ✅ Fee estimation improvements
- ✅ UI/UX enhancements

### Known Limitations
- Lightning Network support not yet implemented
- Limited internationalization (English only)
- Hardware wallet integration pending

---

<div align="center">

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=TristanBietsch/bitcoinJS-wallet&type=Date)](https://star-history.com/#TristanBietsch/bitcoinJS-wallet&Date)

---

**Built with ❤️ for Bitcoin sovereignty**

*Nummus - Your Bitcoin, Your Rules* 🪙

[⬆️ Back to top](#nummus-bitcoin-wallet-)

</div>

---

## 📋 Table of Contents

- [About Nummus](#-about-nummus)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation & Configuration](#-installation--configuration)
- [Security](#️-security)
- [Network Configuration](#-network-configuration)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)
- [Support & Community](#-support--community)
- [Roadmap](#️-roadmap)
- [Architecture](#️-architecture)
- [Project Status](#-project-status)