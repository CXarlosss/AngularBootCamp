import { Outlet } from "react-router-dom";
import PlaygroundNavbar from "./PlaygroundNavbar";
import PlaygroundFooter from "./PlaygroundFooter";
import LabSidebar from "./LabSidebar";

import "../styles/playground.variables.css";
import "../styles/playground.layout.css";

const PlaygroundLayout = () => {
  return (
    <div className="playground-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <PlaygroundNavbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LabSidebar />
        <main className="playground-content" style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};


export default PlaygroundLayout;
