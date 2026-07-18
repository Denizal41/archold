# ArcHold

ArcHold is a deadline-aware milestone escrow dApp built for Arc Testnet. A payer funds work in USDC, a contractor delivers it, and the payment is settled transparently onchain.

[Live site](https://archold.vercel.app) · [Open the app](https://archold.vercel.app/app) · [V3 contract on ArcScan](https://testnet.arcscan.app/address/0x8c8b0E1503Bb78C13a70e4Fa7DbD4594D6C4F2d3)

> Testnet only. Do not use real funds or deploy this version to mainnet.

## Site map

- `/` explains the trust and payment problem ArcHold addresses, its current use cases, and the future trade-document opportunity.
- `/arc` explains Arc, USDC, wallets, smart contracts, and ArcScan for a non-technical reader.
- `/app` opens the working Arc Testnet escrow interface.

## Product scope

ArcHold's current MVP supports proof-based freelance, agency, and vendor milestones. A trade-document workflow is a future integration path: an electronic bill-of-lading provider or other trusted verifier could attest a shipment event before settlement.

ArcHold does not currently validate bills of lading, replace banks or letters of credit, perform identity or compliance checks, or provide legal dispute resolution. Moving between fiat currency and USDC still depends on regulated financial providers. This distinction is stated explicitly on the public landing page.

## Why ArcHold

Simple payment demos prove that a wallet can send tokens. ArcHold demonstrates a complete programmable-money workflow:

- Connect an injected EVM wallet and switch to Arc Testnet (`5042002`).
- Show native gas USDC and ERC-20 USDC interface balances separately.
- Create and fund deadline-aware milestones.
- Discover a wallet's real escrow records directly from the contract.
- Batch bounded record reads through Arc Multicall3.
- Display an exact protected-value aggregate across every active escrow.
- Reject incompatible V1/V2 contract addresses before enabling transactions.
- Persist an accessible light/dark theme with a responsive ArcHold wordmark.
- Let the contractor permanently anchor a public delivery-proof link onchain.
- Release completed work only after delivery proof is submitted.
- Let the contractor claim payment after a 48-hour payer review period.
- Let the contractor return funds voluntarily.
- Let the payer refund after the deadline only when no delivery was submitted.
- Link successful transactions and the deployed contract to ArcScan.

## Stack

- React, TypeScript, Vite
- Viem for Arc reads and wallet transactions
- Solidity `0.8.28`
- Hardhat 3 with Node's test runner and Viem
- Vercel-compatible static deployment

## Arc configuration

| Field | Value |
|---|---|
| Network | Arc Testnet |
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| Native gas token | USDC (18 decimals) |
| ERC-20 USDC interface | `0x3600000000000000000000000000000000000000` (6 decimals) |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| ArcHold contract version | `3` |

Re-check these values against the [official Arc documentation](https://docs.arc.io/arc/references/contract-addresses) before every deployment.

## Arc Testnet deployment history

- V3 address: `0x8c8b0E1503Bb78C13a70e4Fa7DbD4594D6C4F2d3`
- Explorer: [ArcHoldEscrow V3 on ArcScan](https://testnet.arcscan.app/address/0x8c8b0E1503Bb78C13a70e4Fa7DbD4594D6C4F2d3)
- Deployment transaction: [view on ArcScan](https://testnet.arcscan.app/tx/0xaa37d33960f2bfb812c78da401a6fc14b6701bfb7b439f5dc35f6dc93b7b6704)
- Deployer: `0xef28Dd247dB0435621C834149B3e48774Aaf9efF`
- V2 address: `0x37bCCe2C73Dc59B9e1Fd5a8aB43E5A828eB0B11E`
- Explorer: [ArcHoldEscrow V2 on ArcScan](https://testnet.arcscan.app/address/0x37bCCe2C73Dc59B9e1Fd5a8aB43E5A828eB0B11E)
- V1 address: `0x30a81e612ad2819582cbede491b55f4dbbb59156`
- Explorer: [ArcHoldEscrow V1 on ArcScan](https://testnet.arcscan.app/address/0x30a81e612ad2819582cbede491b55f4dbbb59156)

The V3 source code is fully verified and published on ArcScan. The earlier V1/V2 deployment addresses were checked through the official Arc Testnet RPC; V2 introduced onchain delivery proof and proof-required release.

### Verified V3 end-to-end demo

- Milestone: `ArcHold V3 end-to-end settlement` (`#0`)
- Value: `1 USDC`
- Payer: `0xef28Dd247dB0435621C834149B3e48774Aaf9efF`
- Contractor: `0x89860568cd76c7AcAA926Edff04aF54BfA55Acaf`
- [Escrow created and funded](https://testnet.arcscan.app/tx/0x90283a7995d574cd1fc837aa67f11b6685214d2388dd445e2f1faff1234d6adf)
- [Immutable delivery proof submitted](https://testnet.arcscan.app/tx/0x2d2a8bf402950b23b34643d1d444738dd8be307e2070c535bf8af0a491822a11)
- [Payment released to contractor](https://testnet.arcscan.app/tx/0xad2acdd77cf0601dd0bd6611ea1901a6b211547aa6b32f933ba240a7eaa6fccb)
- Final active protected value: `0` for both parties

### Verified V2 delivery-proof demo

- Milestone: `ArcHold V2 delivery-proof demo` (`#1`)
- Value: `1 USDC`
- Contractor: `0x89860568cd76c7AcAA926Edff04aF54BfA55Acaf`
- [Escrow created and funded](https://testnet.arcscan.app/tx/0xd847cc8c78794c664274cdb4effd7d12aeb93285fd6e5b1daaa14ef559de6291)
- [Delivery proof submitted](https://testnet.arcscan.app/tx/0x32a49826cfe48a33144620479c8619b05ffe82fff670137c10c69bee55327533)
- [Payment released to contractor](https://testnet.arcscan.app/tx/0xb0c49f41cf2996f7a2e9b64c4c6d44aa4f107ccbcf778b2eb1fed4ee15687f6e)

### Verified V1 end-to-end demo

- Milestone: `ArcHold landing page milestone`
- Value: `5 USDC`
- Contractor: `0x89860568cd76c7AcAA926Edff04aF54BfA55Acaf`
- [Escrow created and funded](https://testnet.arcscan.app/tx/0x0305b1a5a9073ddd695fd27f581cbfb9ca78aa7469b8a45c89d113dc31266e8f)
- [Payment released to contractor](https://testnet.arcscan.app/tx/0xe3ecbbbb30a89136b6eb7a2e83060540cb79e1a997cf0e95fed8c0efb1b3b100)

## Local development

Node.js `22.13.0` or newer is required by Hardhat 3.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Quality checks

```bash
npm run test
npm run lint
npm run build
```

`npm run test` runs five frontend boundary/configuration tests and eight Solidity contract tests. The contract suite covers funding, the exact active aggregate, V3 identification, paginated discovery, immutable delivery proof, proof-required release, review-period claims, late-delivery rejection, protected refunds, contractor returns, and invalid milestones.

## Arc Testnet deployment

Never commit a private key or place it in `.env`. Load a dedicated testnet key into the current terminal without echoing it or storing it in shell history:

```bash
read -rsp "Arc Testnet private key: " ARC_TESTNET_PRIVATE_KEY
export ARC_TESTNET_PRIVATE_KEY
echo
```

Run the read-only preflight, deploy after verifying the displayed address and balance, then clear the key from the shell:

```bash
npm run contract:preflight
npm run contract:deploy
unset ARC_TESTNET_PRIVATE_KEY
```

`npm run contract:sync` rebuilds the contract and refreshes the browser-safe deployment bytecode used by the optional one-click deploy flow.

Copy the resulting contract address into a local `.env` file:

```env
VITE_ESCROW_ADDRESS=0x8c8b0E1503Bb78C13a70e4Fa7DbD4594D6C4F2d3
```

The app deliberately disables escrow transactions until this public contract address is configured.

## Vercel deployment

Production URL: [https://archold.vercel.app](https://archold.vercel.app)

1. Import the GitHub repository in Vercel.
2. Add `VITE_ESCROW_ADDRESS` as an environment variable.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Deploy and test the full wallet flow on the live URL.

## Contract rules

- The payer chooses the contractor, amount, description, and future deadline.
- Only the contractor can submit its public delivery-proof link.
- Delivery proof can only be submitted once and before the deadline.
- Only the payer can release a delivered milestone during review.
- The contractor can claim payment after the 48-hour review period.
- The contractor can return a funded milestone at any time.
- The payer can refund after the deadline only if delivery was not submitted.
- Settled milestones cannot be settled again.
- The active value for both parties increases on funding and returns to zero when a milestone settles.
- `contractVersion()` identifies the deployed interface as V3.
- The description is limited to 160 bytes.
- The delivery-proof URI is limited to 240 bytes.
- Contract entry points use checks-effects-interactions and a reentrancy guard.

## Known limitations

- This MVP supports one payment per milestone.
- It does not include third-party dispute arbitration.
- The contract has not received a professional external audit.
- Arc Testnet infrastructure and contract addresses may change.

See [SECURITY.md](SECURITY.md) for the threat model, controls, and responsible disclosure guidance.
