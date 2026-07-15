import { ArrowUpRight } from "lucide-react";
import { ARC_EXPLORER } from "../arc";
import { BrandMark } from "./BrandMark";
import { ThemeButton } from "./ThemeButton";

interface MarketingHeaderProps {
  readonly activePage: "home" | "arc";
}

export const MarketingHeader = ({ activePage }: MarketingHeaderProps): React.JSX.Element => (
  <header className="topbar marketing-header">
    <BrandMark/>
    <nav aria-label="Primary navigation">
      <a aria-current={activePage === "home" ? "page" : undefined} href="/">Why ArcHold</a>
      <a aria-current={activePage === "arc" ? "page" : undefined} href="/arc">What is Arc?</a>
      <a href={ARC_EXPLORER} target="_blank" rel="noreferrer">ArcScan <ArrowUpRight size={14}/></a>
    </nav>
    <div className="header-actions">
      <ThemeButton/>
      <a className="header-cta" href="/app">Open app</a>
    </div>
  </header>
);
