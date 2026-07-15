import { ArrowUpRight } from "lucide-react";

export const PageFooter = (): React.JSX.Element => (
  <footer className="page-footer">
    <span>ArcHold · Arc Testnet demonstration</span>
    <span className="footer-links">
      <a href="https://docs.arc.io/arc-chain" target="_blank" rel="noreferrer">Arc docs <ArrowUpRight size={12}/></a>
      <a href="https://dcsa.org/standards/bill-of-lading" target="_blank" rel="noreferrer">DCSA eBL <ArrowUpRight size={12}/></a>
    </span>
  </footer>
);
