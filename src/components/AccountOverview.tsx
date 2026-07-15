import { ArrowUpRight, ExternalLink, Landmark, LoaderCircle, Rocket, ShieldCheck } from "lucide-react";
import { ARC_EXPLORER, ARC_FAUCET } from "../arc";
import { formatBalance, shortenAddress } from "../utils/format";
import type { Address } from "viem";
import type { ContractCompatibility } from "../types/escrow";

interface AccountOverviewProps {
  readonly contract?: Address;
  readonly compatibility: ContractCompatibility;
  readonly tokenBalance?: bigint;
  readonly gasBalance?: bigint;
  readonly protectedValue?: bigint;
  readonly isDeploying: boolean;
  onDeploy(): void;
}

const ContractState = ({ contract, compatibility }: Pick<AccountOverviewProps, "contract" | "compatibility">): React.JSX.Element => {
  if (!contract) return <strong>Ready to deploy</strong>;
  if (compatibility === "checking") return <strong>Checking V3…</strong>;
  if (compatibility === "error") return <strong className="contract-error">Verification unavailable · retrying</strong>;
  if (compatibility !== "compatible") return <strong className="contract-error">Unsupported contract version</strong>;
  return <a href={`${ARC_EXPLORER}/address/${contract}`} target="_blank" rel="noreferrer">{shortenAddress(contract)} <ArrowUpRight size={12}/></a>;
};

export const AccountOverview = (props: AccountOverviewProps): React.JSX.Element => (
  <div className="overview">
    <div className="balances">
      <div><span>ERC-20 USDC</span><strong>{props.tokenBalance === undefined ? "—" : `${formatBalance(props.tokenBalance, 6)} USDC`}</strong><small>Available for funding</small></div>
      <div><span>Protected value</span><strong>{props.protectedValue === undefined ? "—" : `${formatBalance(props.protectedValue, 6)} USDC`}</strong><small>Across all active escrows</small></div>
    </div>
    <div className="gas-line"><span>Native Gas USDC</span><strong>{props.gasBalance === undefined ? "—" : `${formatBalance(props.gasBalance, 18)} USDC`}</strong></div>
    <div className="deployment-line"><div><span>ESCROW CONTRACT · V3</span><ContractState contract={props.contract} compatibility={props.compatibility}/></div>
      {!props.contract && <button disabled={props.isDeploying} onClick={props.onDeploy}>{props.isDeploying ? <><LoaderCircle className="spin" size={14}/> Deploying…</> : <><Rocket size={14}/> Deploy contract</>}</button>}
    </div>
    <div className="safety"><ShieldCheck size={19}/><p><strong>Deadline-aware protection.</strong> Delivery proof is immutable. The payer gets 48 hours to review; afterward the contractor can claim payment.</p></div>
    <a className="faucet" href={ARC_FAUCET} target="_blank" rel="noreferrer"><Landmark size={17}/><span>Get test USDC</span><ExternalLink size={15}/></a>
  </div>
);
