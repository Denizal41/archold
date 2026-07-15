import { useState } from "react";
import { AccountOverview } from "../components/AccountOverview";
import { DeliveryDialog } from "../components/DeliveryDialog";
import { EscrowForm } from "../components/EscrowForm";
import { EscrowTable } from "../components/EscrowTable";
import { ExternalLinkDialog } from "../components/ExternalLinkDialog";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { useArcHoldApp } from "../hooks/useArcHoldApp";
import type { Dispatch, SetStateAction } from "react";
import type { ArcHoldController } from "../hooks/useArcHoldApp";
import type { EscrowRecord } from "../types/escrow";

interface WorkspaceContentProps {
  readonly app: ArcHoldController;
  setDeliveryTarget: Dispatch<SetStateAction<EscrowRecord | undefined>>;
  setExternalHref: Dispatch<SetStateAction<string | undefined>>;
}

const WorkspaceContent = ({ app, setDeliveryTarget, setExternalHref }: WorkspaceContentProps): React.JSX.Element => <>
  <Header address={app.wallet.address} onConnect={() => void app.wallet.connect()} onSwitchAccount={() => void app.wallet.switchAccount()}/>
  <Hero isCorrectNetwork={app.wallet.isCorrectNetwork} onSwitchNetwork={() => void app.wallet.switchNetwork()}/>
  <section id="workspace" className="workspace">
    <EscrowForm isBusy={app.transactions.busyAction === "create"} notice={app.notice} onCreate={app.createEscrow}/>
    <AccountOverview contract={app.contract} compatibility={app.compatibility} tokenBalance={app.wallet.tokenBalance}
      gasBalance={app.wallet.gasBalance} protectedValue={app.wallet.address ? app.records.protectedValue : undefined}
      isDeploying={app.transactions.busyAction === "deploy"} onDeploy={() => void app.deployContract()}/>
  </section>
  <EscrowTable address={app.wallet.address} contract={app.contract} records={app.records.records}
    recordCount={app.records.recordCount} isLoading={app.records.isLoading} isBusy={Boolean(app.transactions.busyAction)}
    now={app.now} onDeliver={setDeliveryTarget} onOpenProof={setExternalHref}
    onSettle={(record, action) => void app.settleEscrow(record, action)}/>
  <HowItWorks/>
</>;

const WorkspacePage = (): React.JSX.Element => {
  const [deliveryTarget, setDeliveryTarget] = useState<EscrowRecord>();
  const [externalHref, setExternalHref] = useState<string>();
  const app = useArcHoldApp();
  return <main className="shell">
    <WorkspaceContent app={app} setDeliveryTarget={setDeliveryTarget} setExternalHref={setExternalHref}/>
    {deliveryTarget && <DeliveryDialog record={deliveryTarget} isBusy={Boolean(app.transactions.busyAction)}
      onClose={() => setDeliveryTarget(undefined)} onSubmit={app.transactions.submitDelivery}/>}
    {externalHref && <ExternalLinkDialog href={externalHref} onClose={() => setExternalHref(undefined)}/>}
  </main>;
};

export default WorkspacePage;
