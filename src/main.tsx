import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { FormStateProvider } from "./state/FormStateContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FormStateProvider>
      <App />
    </FormStateProvider>
  </StrictMode>,
);
