import "../parallax.variables.css";
import "../parallax.global.css";

import { ParallaxSystemProvider } from "../context/ParallaxSystemContext";
import ParallaxApp from "./ParallaxApp";

export default function ParallaxPortfolio() {
  return (
    <ParallaxSystemProvider>
      <ParallaxApp />
    </ParallaxSystemProvider>
  );
}