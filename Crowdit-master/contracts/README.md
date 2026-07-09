# Crowdit Soroban Contracts

This workspace contains the Soroban contracts that power Crowdit on Stellar testnet:

- `contracts/crowdfund` for campaign creation, backing, claims, and refunds
- `contracts/reward-token` for the separate reward line minted during successful backing

## Workspace flow

1. Install the Stellar CLI and Rust wasm target:
   - `cargo install --locked stellar-cli`
   - `rustup target add wasm32v1-none`
2. Run tests:
   - `cargo test --manifest-path contracts/crowdfund/Cargo.toml`
   - `cargo test --manifest-path contracts/reward-token/Cargo.toml`
3. Build release wasm:
   - `cargo build --target wasm32v1-none --release --manifest-path contracts/crowdfund/Cargo.toml`
   - `cargo build --target wasm32v1-none --release --manifest-path contracts/reward-token/Cargo.toml`

## Deployment path

1. Fund a Stellar testnet account.
2. Compile both wasm artifacts.
3. Deploy the reward token contract.
4. Deploy the crowdfund contract.
5. Wire the crowdfund contract to the reward token contract.
6. Save the live ids in the frontend environment variables.

## Live testnet deployment

- Crowdfund contract ID:
  `CDYGGIEGRZKKCKTAZ6SWE77SSCYAL6CPBQ5BDR74NCXYGSEQULD5GFYG`
- Crowdfund deploy transaction:
  `a3066535d3f1a913dc9b099b07e010ea891420939dbb0d671bea3aa06c88e629`
- Reward token contract ID:
  `CBLZZZAV7T7FWNJX3WDRYLPEJUIAKMDIMBUV5ZIEPOC4I72PSOP6N4MB`
- Reward token deploy transaction:
  `df768b4c7452d40eeecbb97531ee7a543b3ab3df2e9d9919960b4e6b75e377cf`
- Reward token metadata:
  `Crowdit Reward (CRD)`

## Notes

- The frontend reads these values through `.env.local` / `.env.example`.
- The deployed setup was verified with inter-contract reward minting enabled from the crowdfund contract.
