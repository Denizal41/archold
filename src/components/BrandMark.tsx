import { CircleDot } from "lucide-react";

export const BrandMark = (): React.JSX.Element => (
  <a className="brand" href="/" aria-label="ArcHold home">
    <span className="brand-name"><em>Arc</em>Hold</span>
    <span className="brand-network"><CircleDot size={11}/>TESTNET</span>
  </a>
);
