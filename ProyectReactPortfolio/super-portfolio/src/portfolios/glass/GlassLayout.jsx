import { Outlet } from "react-router-dom";
import "./styles/glass.css";
import Navbar from "./common/Navbar";
import Footer from "./common/Footer";

const GlassLayout = () => {
  return (
    <div className="glass-theme">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default GlassLayout;
