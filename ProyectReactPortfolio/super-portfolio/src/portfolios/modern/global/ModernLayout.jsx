// @ts-nocheck
import { Outlet } from "react-router-dom";
import styles from "./modern.layout.module.css";
import "../modern.base.css";   // 👈 IMPORT GLOBAL SIN styles

import ModernNavbar from "./ModernNavbar";
import ModernFooter from "./ModernFooter";

export default function ModernLayout() {
  return (
    <div className={styles["modern-layout"]}>
      <ModernNavbar />
      <main>
        <Outlet />
      </main>
      <ModernFooter />
    </div>
  );
}
