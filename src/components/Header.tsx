import { ArrowLeftRight, ArrowUpRight, Wallet } from "lucide-react";
import { ARC_EXPLORER } from "../arc";
import { shortenAddress } from "../utils/format";
import { BrandMark } from "./BrandMark";
import { ThemeButton } from "./ThemeButton";
import type { Address } from "viem";

interface HeaderProps {
  readonly address?: Address;
  onConnect(): void;
  onSwitchAccount(): void;
}

export const Header = ({ address, onConnect, onSwitchAccount }: HeaderProps): React.JSX.Element => {
  return <header className="topbar">
    <BrandMark/>
    <nav aria-label="Primary navigation">
      <a href="/">Why ArcHold</a>
      <a href="/arc">What is Arc?</a>
      <a href={ARC_EXPLORER} target="_blank" rel="noreferrer">ArcScan <ArrowUpRight size={14}/></a>
    </nav>
    <div className="header-actions">
      <ThemeButton/>
      <button className="wallet-button" onClick={address ? onSwitchAccount : onConnect}>
        <Wallet size={16}/>{address ? <><span>{shortenAddress(address)}</span><span className="switch-label"><ArrowLeftRight size={12}/> Switch</span></> : "Connect wallet"}
      </button>
    </div>
  </header>;
};
