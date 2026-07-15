# ArcHold Security

ArcHold is a testnet-only demonstration. It has not received a professional external audit and must not be used with real funds.

## Threat model

| Boundary | Primary threats | Controls |
|---|---|---|
| Wallet to frontend | Wrong account, wrong chain, malicious transaction prompts | Explicit Arc chain check, visible account, switch-account flow, exact contract calls |
| Frontend to RPC | Untrusted/stale responses, oversized histories | Runtime tuple guards, request sequencing, explicit timeout/retries, Multicall3, bounded 20-record reads |
| Payer to contractor | Withheld payment, late or replaced proof | Immutable pre-deadline proof, 48-hour review, contractor claim path |
| Contract to USDC | Reentrancy, failed transfer, wrong token | Immutable official token address, checks-effects-interactions, reentrancy guard, checked return values |
| Delivery proof link | Phishing, insecure transport | HTTPS/IPFS-only rendering, credential rejection, external-domain warning, noopener/noreferrer |
| Repository and CI | Secret leakage, vulnerable dependencies | Ignored environment files, Gitleaks, production audit, deterministic lockfile |

## Security properties

- No administrator or owner can withdraw escrowed funds.
- Only the payer can release a delivered escrow.
- Only the contractor can submit delivery proof or return funds.
- Delivery proof is immutable and must be submitted before the deadline.
- If the payer does not release within 48 hours, the contractor can claim payment.
- A payer refund is available after expiry only when no delivery was submitted.
- Settlement functions update state before transferring USDC.
- `activeValueByParty` is updated on every funding and terminal settlement path.
- The frontend verifies `contractVersion() == 3` before loading records or enabling transactions.
- Late wallet/RPC responses cannot overwrite the latest selected account.

## Known limitations

- There is no third-party dispute arbitration.
- Public proof links may contain harmful content despite the navigation warning.
- Arc Testnet and its system contracts may change.
- Security review and automated tests reduce risk but do not replace an independent audit.

## Reporting a vulnerability

Do not publish exploitable details in a public issue. Use GitHub private vulnerability reporting when enabled on the repository and include affected code, impact, and reproduction steps.
