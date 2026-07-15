import { Check } from "lucide-react";

export const HowItWorks = (): React.JSX.Element => <>
  <section id="how" className="how">
    <div><p className="eyebrow">THE FLOW</p><h2>A simple contract.<br/>A clear settlement.</h2></div>
    <ol>
      <li><span>01</span><div><strong>Fund</strong><p>The payer deposits USDC and sets a delivery deadline.</p></div></li>
      <li><span>02</span><div><strong>Deliver</strong><p>The contractor permanently anchors proof before the deadline.</p></div></li>
      <li><span>03</span><div><strong>Settle</strong><p>The payer releases during review, or the contractor claims after 48 hours.</p></div></li>
    </ol>
  </section>
  <footer><span>Built for Arc Testnet</span><span>USDC-native settlement <Check size={14}/></span></footer>
</>;
