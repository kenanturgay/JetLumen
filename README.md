# JetLumen — Stellar Network Based DeFi Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-13.4-black.svg)](https://nextjs.org/)
[![Stellar SDK](https://img.shields.io/badge/Stellar_SDK-9.0-3e1BDB.svg)](https://developers.stellar.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

JetLumen is a decentralized finance (DeFi) platform built on the Stellar Network, offering seamless micro-remittance services with advanced features like time-locked transfers and atomic swaps.

## 🚀 Features

- **Direct Transfers**: Send XLM instantly to any Stellar address
- **Time-Locked Transfers**: Schedule transfers with customizable unlock times
- **Atomic Swaps**: Create and execute trustless peer-to-peer asset exchanges
- **Freighter Integration**: Seamless wallet connection and transaction signing
- **Real-time State Updates**: Instant transaction status and balance updates

## 📋 Prerequisites

- Node.js 16.x or later
- NPM 7.x or later
- [Freighter Wallet Browser Extension](https://www.freighter.app/)
- Rust toolchain (for contract development)

## 🛠️ Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/kenanturgay/JetLumen.git
   cd JetLumen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
JetLumen/
├── contracts/           # Soroban smart contracts
├── lib/                # Core functionality
│   ├── freighter.ts    # Wallet integration
│   └── soroban.ts      # Stellar Network operations
├── pages/              # Next.js pages and API routes
└── styles/             # Global styles and Tailwind CSS
```

## 💻 Core Components

### Soroban Integration (`lib/soroban.ts`)
- Transaction builder and submission
- Account management
- Smart contract interactions
- Custom operation handling

### Features
- **Transfer Operations**: Direct XLM transfers
- **Time Lock**: Create time-locked transactions
- **Atomic Swaps**: Trustless peer-to-peer exchanges
- **State Management**: Real-time transaction tracking

## 🔧 Smart Contract Development

### Building the Soroban Contract

1. Add WebAssembly target:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

2. Build the contract:
   ```bash
   cd contracts/jetlumen
   cargo build --release --target wasm32-unknown-unknown
   ```

The compiled WASM will be available at: `contracts/jetlumen/target/wasm32-unknown-unknown/release/jetlumen.wasm`

## 🌐 Deployment

### Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SOROBAN_RPC=https://rpc-futurenet.stellar.org
NEXT_PUBLIC_CONTRACT_ID=your_contract_id_here
```

See `StellarDeploy.md` for detailed deployment instructions.

## 📚 Additional Documentation

- `pdr.md` - Product Design Requirements
- `FreighterWalletDocs.md` - Freighter Integration Guide
- `StellarDeploy.md` - Deployment Documentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Links

- [Stellar Network](https://www.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)

