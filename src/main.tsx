import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/fonts.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/records.css";
import "./styles/responsive.css";
import "./styles/marketing.css";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("ArcHold root element was not found.");

createRoot(root).render(
  <StrictMode><App /></StrictMode>,
);
