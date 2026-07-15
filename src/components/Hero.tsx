import { ChevronRight } from "lucide-react";

interface HeroProps {
  readonly isCorrectNetwork: boolean;
  onSwitchNetwork(): void;
}

export const Hero = ({ isCorrectNetwork, onSwitchNetwork }: HeroProps): React.JSX.Element => (
  <section className="intro">
    <div>
      <p className="eyebrow">ARC TESTNET · MILESTONE ESCROW</p>
      <h1>Work ships.<br/><em>Payment settles</em> with trust.</h1>
      <p className="lead">A deadline-aware USDC escrow for freelancers and small teams—transparent, verifiable, and settled on Arc.</p>
    </div>
    <aside className="network-card">
      <span className={isCorrectNetwork ? "status good" : "status"}></span>
      <div><strong>{isCorrectNetwork ? "Connected to Arc Testnet" : "Waiting for network connection"}</strong><small>Gas token: Native USDC · Chain 5042002</small></div>
      {!isCorrectNetwork && <button onClick={onSwitchNetwork}>Switch network <ChevronRight size={15}/></button>}
    </aside>
  </section>
);
