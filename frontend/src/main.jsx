import { createRoot } from "react-dom/client";
import "./index.css";
import { HeroUIProvider } from "@heroui/react";
import AppWrapper from "./App";

createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <AppWrapper />
  </HeroUIProvider>
);
