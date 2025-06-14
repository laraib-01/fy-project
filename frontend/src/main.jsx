import { createRoot } from "react-dom/client";
import "./index.css";
import { HeroUIProvider } from "@heroui/react";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <App />
  </HeroUIProvider>
);
