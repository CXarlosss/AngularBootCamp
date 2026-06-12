import { Outlet } from "react-router-dom";
import CreativeNavbar from "./CreativeNavbar";
import CreativeFooter from "./CreativeFooter";
import CreativeBackground from "../components/CreativeBackground";
import { useEffect } from "react";

import "../styles/creative.variables.css";
import "../styles/creative.base.css";


export default function CreativeLayout() {
  useEffect(() => {
    document.body.classList.add("theme-creative");
    return () => {
      document.body.classList.remove("theme-creative");
    };
  }, []);

  return (
    <>
      <CreativeBackground />
      <CreativeNavbar />
      <main className="creative-content">
        <Outlet />
      </main>
      <CreativeFooter />
    </>
  );
}