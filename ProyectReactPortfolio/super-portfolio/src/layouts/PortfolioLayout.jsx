import { Outlet } from "react-router-dom";
import MainLayout from "./MainLayout";

const PortfolioLayout = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default PortfolioLayout;
