import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { installPerformanceProfile } from "./utils/performance";
import "./styles/global.css";
import "./styles/mobile.css";



const removePerformanceProfile = installPerformanceProfile();
if (import.meta.hot) import.meta.hot.dispose(removePerformanceProfile);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
