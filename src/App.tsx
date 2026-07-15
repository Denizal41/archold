import { lazy, Suspense } from "react";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const ArcExplainerPage = lazy(() => import("./pages/ArcExplainerPage"));
const WorkspacePage = lazy(() => import("./pages/WorkspacePage"));

export const App = (): React.JSX.Element => {
  const path = window.location.pathname;
  return (
    <Suspense fallback={<main className="route-loading">Loading ArcHold…</main>}>
      {path === "/arc" ? <ArcExplainerPage/> : path === "/app" ? <WorkspacePage/> : <LandingPage/>}
    </Suspense>
  );
};
