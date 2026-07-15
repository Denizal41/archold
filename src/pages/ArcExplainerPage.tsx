import { ArrowRight, BookOpen, CircleDollarSign, FileCode2, Gauge, ScanSearch, Wallet } from "lucide-react";
import { MarketingHeader } from "../components/MarketingHeader";
import { PageFooter } from "../components/PageFooter";

const concepts = [
  ["Arc", "The settlement network", "It records transactions and runs the agreement's rules."],
  ["USDC", "The programmable dollar", "It is used for both payments and network fees on Arc."],
  ["Wallet", "Your account and signature", "It proves which actions you approved without sharing a password with ArcHold."],
  ["Smart contract", "The automatic agreement", "Code holds funds and permits only the actions written into its rules."],
  ["ArcScan", "The public receipt", "It lets anyone inspect transactions and contract activity."],
] as const;

const arcFeatures = [
  [CircleDollarSign, "Stablecoin-native", "Network fees are paid in USDC, so costs are expressed in familiar dollar terms."],
  [Gauge, "Fast, deterministic finality", "Arc is designed to make transactions final in under a second."],
  [FileCode2, "EVM compatible", "Developers can use familiar Ethereum smart-contract tools and standards."],
] as const;

const ConceptList = (): React.JSX.Element => (
  <section className="marketing-section" aria-labelledby="concept-title">
    <div className="section-heading"><p className="eyebrow">THE FIVE BUILDING BLOCKS</p><h2 id="concept-title">Arc, without the crypto vocabulary.</h2></div>
    <div className="concept-list">{concepts.map(([term, label, copy]) => <article key={term}><strong>{term}</strong><h3>{label}</h3><p>{copy}</p></article>)}</div>
  </section>
);

const FeatureSection = (): React.JSX.Element => (
  <section className="marketing-section" aria-labelledby="feature-title">
    <div className="section-heading"><p className="eyebrow">WHY IT FITS PAYMENTS</p><h2 id="feature-title">Built for programmable money.</h2><p>Arc combines stablecoin economics with the flexibility of smart contracts.</p></div>
    <div className="problem-grid arc-feature-cards">{arcFeatures.map(([Icon, title, copy]) => <article className="problem-item" key={title}><Icon/><h3>{title}</h3><p>{copy}</p></article>)}</div>
  </section>
);

const ComparisonSection = (): React.JSX.Element => (
  <section className="marketing-section" aria-labelledby="comparison-title">
    <div className="section-heading"><p className="eyebrow">A FAIR COMPARISON</p><h2 id="comparison-title">Faster settlement does not erase the real world.</h2></div>
    <div className="comparison-table">
      <div className="comparison-head"><span>Traditional transfer</span><span>Arc settlement</span></div>
      <div><p>May move through intermediaries, banking hours, and reconciliation.</p><p>Operates onchain around the clock with deterministic finality.</p></div>
      <div><p>Trust and records are distributed across institutions and documents.</p><p>Rules and receipts can be inspected from one public ledger.</p></div>
      <div><p>Legal, identity, compliance, and currency conversion happen through regulated providers.</p><p>Those requirements still exist when money enters or leaves USDC.</p></div>
    </div>
  </section>
);

const SourcesSection = (): React.JSX.Element => (
  <section className="source-panel" aria-labelledby="sources-title">
    <BookOpen aria-hidden="true"/>
    <div><h2 id="sources-title">Continue with primary sources</h2><p>ArcHold is an independent testnet project. Network details below come from official Arc and Circle documentation.</p></div>
    <div className="source-links"><a href="https://docs.arc.io/arc-chain" target="_blank" rel="noreferrer">Arc overview <ArrowRight size={14}/></a><a href="https://docs.arc.io/arc/concepts/stablecoin-native-model" target="_blank" rel="noreferrer">Stablecoin model <ArrowRight size={14}/></a><a href="https://www.circle.com/usdc" target="_blank" rel="noreferrer">About USDC <ArrowRight size={14}/></a></div>
  </section>
);

const ArcExplainerPage = (): React.JSX.Element => (
  <div className="shell marketing-page">
    <MarketingHeader activePage="arc"/>
    <main>
      <section className="arc-hero">
        <div><p className="eyebrow">ARC, EXPLAINED</p><h1>A network where digital dollars can follow <em>rules.</em></h1><p>Think of Arc as shared settlement infrastructure. Instead of asking one company to keep the only record, the network executes smart-contract rules and produces a verifiable receipt.</p><div className="marketing-actions"><a className="button-link" href="/app">See it in ArcHold <ArrowRight size={16}/></a><a className="button-link secondary" href="https://docs.arc.io/arc-chain" target="_blank" rel="noreferrer">Read official docs</a></div></div>
        <aside className="arc-definition"><ScanSearch/><span>IN ONE SENTENCE</span><p><strong>Arc is a Layer-1 blockchain</strong> purpose-built for stablecoin finance, with USDC as its native gas currency.</p><small>ArcHold currently runs on Arc Testnet.</small></aside>
      </section>
      <ConceptList/>
      <FeatureSection/>
      <section className="marketing-section arhold-flow" aria-labelledby="archold-flow-title"><div className="section-heading"><p className="eyebrow">ARC + ARCHOLD</p><h2 id="archold-flow-title">What happens after you click “Create escrow”?</h2></div><ol>{["Your wallet signs the request.", "The contract locks USDC under fixed rules.", "Delivery proof becomes part of the public record.", "Settlement produces a transaction receipt on ArcScan."].map((copy, index) => <li key={copy}><span>0{index + 1}</span><p>{copy}</p></li>)}</ol></section>
      <ComparisonSection/>
      <aside className="testnet-note"><Wallet/><div><strong>Testnet means rehearsal, not production.</strong><p>ArcHold uses test assets so the workflow can be demonstrated safely. Its contracts have not received a professional external audit.</p></div></aside>
      <SourcesSection/>
    </main>
    <PageFooter/>
  </div>
);

export default ArcExplainerPage;
