import Navbar from "../components/Navbar/Navbar";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        {children}
      </main>
    </>
  );
};

export default MainLayout;
