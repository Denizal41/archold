import {
  ArrowRight,
  Check,
  Clock3,
  FileCheck2,
  Landmark,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { MarketingHeader } from "../components/MarketingHeader";
import { PageFooter } from "../components/PageFooter";

const problems = [
  ["01", "Paying first creates risk", "Buyers hesitate when delivery is still a promise."],
  ["02", "Delivering first creates risk", "Contractors carry the cost while approval and payment remain uncertain."],
  ["03", "Proof lives in scattered places", "Files, messages, approvals, and payment records rarely share one timeline."],
] as const;

const steps = [
  ["Agree", "Set the work, counterparty, value, and deadline."],
  ["Fund", "Lock USDC in the escrow before work begins."],
  ["Prove", "Anchor an immutable public delivery-proof link."],
  ["Settle", "Release, claim after review, return, or refund by rule."],
] as const;

const useCases = [
  ["Freelance milestones", "Design, development, research, and other proof-based work.", "LIVE MVP"],
  ["Agency and vendor delivery", "Fund a defined deliverable without paying it out in advance.", "LIVE MVP"],
  ["Trade-document settlement", "Connect verified electronic documents to programmable payment rules.", "FUTURE LAYER"],
] as const;

const ProblemSection = (): React.JSX.Element => (
  <section className="marketing-section" aria-labelledby="problem-title">
    <div className="section-heading">
      <p className="eyebrow">THE COORDINATION GAP</p>
      <h2 id="problem-title">Good work gets stuck between trust and payment.</h2>
      <p>ArcHold gives both sides the same verifiable timeline.</p>
    </div>
    <div className="problem-grid">
      {problems.map(([number, title, copy]) => <article className="problem-item" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
    </div>
  </section>
);

const FlowSection = (): React.JSX.Element => (
  <section className="marketing-section flow-section" aria-labelledby="flow-title">
    <div className="section-heading compact">
      <p className="eyebrow">ONE VISIBLE AGREEMENT</p>
      <h2 id="flow-title">From promise to settlement.</h2>
    </div>
    <ol className="flow-list">
      {steps.map(([title, copy], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div><Check aria-hidden="true" size={18}/></li>)}
    </ol>
  </section>
);

const UseCasesSection = (): React.JSX.Element => (
  <section className="marketing-section" aria-labelledby="use-cases-title">
    <div className="section-heading">
      <p className="eyebrow">BUILT FOR VERIFIABLE DELIVERY</p>
      <h2 id="use-cases-title">Start with milestones. Extend to documents.</h2>
      <p>The same escrow pattern can serve different industries—but integrations determine what the contract can truly verify.</p>
    </div>
    <div className="use-case-list">
      {useCases.map(([title, copy, status]) => <article className="use-case-row" key={title}><h3>{title}</h3><p>{copy}</p><span>{status}</span></article>)}
    </div>
  </section>
);

const TradeSection = (): React.JSX.Element => (
  <section className="marketing-section trade-section" aria-labelledby="trade-title">
    <div className="trade-copy">
      <p className="eyebrow">A FUTURE TRADE WORKFLOW</p>
      <h2 id="trade-title">Could a bill of lading trigger payment?</h2>
      <p>Yes—with a trusted electronic bill-of-lading verifier. A buyer could fund a milestone, a document provider could attest the required event, and the escrow could release under agreed rules.</p>
      <a href="https://dcsa.org/standards/bill-of-lading" target="_blank" rel="noreferrer">Why electronic bills of lading matter <ArrowRight size={15}/></a>
    </div>
    <div className="trade-diagram" aria-label="Illustrative future trade settlement flow">
      <div><WalletCards/><span>Buyer funds</span></div><ArrowRight/><div><FileCheck2/><span>eBL verified</span></div><ArrowRight/><div><Landmark/><span>USDC settles</span></div>
    </div>
    <aside className="truth-note">
      <ShieldCheck aria-hidden="true"/>
      <div><strong>What ArcHold does today</strong><p>It stores a public proof URL and settles through payer approval or a 48-hour claim rule. It does not yet validate shipping documents, replace banks or letters of credit, perform KYC/AML, or resolve legal disputes.</p></div>
    </aside>
  </section>
);

const ArcSection = (): React.JSX.Element => (
  <section className="marketing-section arc-teaser" aria-labelledby="arc-title">
    <div className="section-heading compact">
      <p className="eyebrow">WHY ARC</p>
      <h2 id="arc-title">A settlement network designed around stablecoins.</h2>
      <a className="text-link" href="/arc">Learn Arc from the beginning <ArrowRight size={15}/></a>
    </div>
    <div className="arc-feature-list">
      <div><WalletCards/><strong>USDC-denominated fees</strong><span>Costs stay understandable in dollar terms.</span></div>
      <div><Clock3/><strong>Deterministic finality</strong><span>Transactions reach finality in under a second.</span></div>
      <div><ScanSearch/><strong>Public verification</strong><span>Agreements and settlement receipts remain inspectable.</span></div>
    </div>
  </section>
);

const LandingPage = (): React.JSX.Element => (
  <div className="shell marketing-page">
    <MarketingHeader activePage="home"/>
    <main>
      <section className="marketing-hero">
        <div className="marketing-copy">
          <p className="eyebrow">USDC MILESTONE ESCROW ON ARC</p>
          <h1>Pay when the work is <em>proven.</em></h1>
          <p>ArcHold locks payment before work begins, anchors delivery proof onchain, and settles by approval or deadline—so neither side has to rely on a promise alone.</p>
          <div className="marketing-actions"><a className="button-link" href="/app">Open live testnet demo <ArrowRight size={16}/></a><a className="button-link secondary" href="/arc">What is Arc?</a></div>
          <small><LockKeyhole size={13}/> Testnet demonstration. No real funds.</small>
        </div>
        <aside className="hero-proof" aria-label="ArcHold agreement summary">
          <div className="proof-head"><span>AGREEMENT · 001</span><ShieldCheck size={20}/></div>
          <h2>Landing page delivery</h2>
          <dl><div><dt>VALUE LOCKED</dt><dd>1,500 USDC</dd></div><div><dt>DELIVERY</dt><dd>Proof required</dd></div><div><dt>REVIEW</dt><dd>48 hours</dd></div><div><dt>NETWORK</dt><dd>Arc</dd></div></dl>
          <p><span></span>Funded and protected</p>
        </aside>
      </section>
      <ProblemSection/>
      <FlowSection/>
      <UseCasesSection/>
      <TradeSection/>
      <ArcSection/>
    </main>
    <PageFooter/>
  </div>
);

export default LandingPage;
