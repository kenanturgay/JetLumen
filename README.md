# JetLumen — Minimal Micro-Remittance dApp

This workspace contains a minimal Next.js (TypeScript) frontend, a simple simulated backend API, and a Soroban contract skeleton for JetLumen.

Files of interest:

- `pdr.md` — product design requirements
- `FreighterWalletDocs.md` — Freighter usage notes
- `StellarDeploy.md` — deploy notes

Quick start (install dependencies):

1. npm install
2. npm run dev

Notes:
- The frontend uses Freighter to connect and sign. It simulates contract state updates by calling `/api/transfer` which updates `data/state.json`.
- The Soroban contract is in `contracts/jetlumen` and matches the required API. Deploy steps are in `StellarDeploy.md`.

Building the Soroban contract (locally):

1. Install Rust toolchain and add wasm target:

	rustup target add wasm32-unknown-unknown

2. In `contracts/jetlumen` run:

	cargo build --release --target wasm32-unknown-unknown

3. The compiled wasm will be at `contracts/jetlumen/target/wasm32-unknown-unknown/release/jetlumen.wasm`.

See `StellarDeploy.md` for testnet deploy commands using `stellar-cli`/`soroban` tools.

Using a real deployed contract from the frontend

1. After you deploy your contract to Testnet you will get a contract id (starts with `C...`).
2. Set these environment variables in your Next.js environment (for development, create a `.env.local` file at the project root):

```
NEXT_PUBLIC_SOROBAN_RPC=https://rpc-futurenet.stellar.org   # or your soroban RPC url
NEXT_PUBLIC_CONTRACT_ID=CYOUR_CONTRACT_ID_HERE
```

3. Restart `npm run dev`. The Transfer page will attempt to call the real contract when these are set. If they are not set, the app will continue to use the local JSON simulation.

