import GlassPortfolio from "../portfolios/glass/GlassLayout";
import NeumorphismPortfolio from "../portfolios/neumorphism/NeumorphismPortfolio";
import CssPortfolio from "../portfolios/css-playground/CssPortfolio";
import ParallaxPortfolio from "../portfolios/parallax/layout/ParallaxPortfolio";
import RetroPortfolio from "../portfolios/retro/RetroPortfolio";
import CreativePortfolio from "../portfolios/creative/CreativePortfolio";
import ModernPortfolio from "../portfolios/modern/pages/ModernPortfolio";
const portfolioRegistry = [
  {
    id: "glass",
    title: "Glass",
    path: "/portfolio/glass",
    component: GlassPortfolio,
    type: "microsite",
    maturity: "stable",
    description: "Glass UI aesthetic portfolio variant"
  },
  {
    id: "neumorphism",
    title: "Neumorphism",
    path: "/portfolio/neumorphism",
    component: NeumorphismPortfolio,
    type: "microsite",
    maturity: "experimental",
    description: "Soft UI / neumorphic design variant"
  },
  {
    id: "css-playground",
    title: "CSS Playground",
    path: "/portfolio/css-playground",
    component: CssPortfolio,
    type: "sandbox",
    maturity: "experimental",
    description: "CSS experimentation environment"
  },
    
  {
    id: "parallax",
    title: "Architecture System",
    path: "/portfolio/parallax",
    component: ParallaxPortfolio,
    type: "system-interface",
    maturity: "flagship",
    description: "Engineering architecture visualization interface"
  },
  {
    id: "retro",
    title: "Retro",
    path: "/portfolio/retro",
    component: RetroPortfolio,
    type: "microsite",
    maturity: "stable",
    description: "Retro UI system simulation"
  },
  {
    id: "creative",
    title: "Creative",
    path: "/portfolio/creative",
    component: CreativePortfolio,
    type: "microsite",
    maturity: "stable",
    description: "Creative expressive portfolio variant"
  },
  {
    id: "modern",
    title: "Modern",
    path: "/portfolio/modern",
    component: ModernPortfolio,
    type: "microsite",
    maturity: "stable",
    description: "Modern clean portfolio variant"
  },
 
];

export default portfolioRegistry;