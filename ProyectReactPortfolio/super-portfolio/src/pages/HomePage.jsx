import MainLayout from "../layouts/MainLayout";
import styles from "./HomePage.module.css";

// Components
import HeroSection from "../components/home/HeroSection";
import ExecutiveSnapshot from "../components/home/ExecutiveSnapshot";
import FeaturedWorkSection from "../components/home/FeaturedWorkSection";
import ProfessionalFooter from "../components/home/ProfessionalFooter";

const HomePage = () => {
  return (
    <MainLayout>
      <div className={styles.homeWrapper}>
        <HeroSection />
        <ExecutiveSnapshot />
        <FeaturedWorkSection />
        <ProfessionalFooter />
      </div>
    </MainLayout>
  );
};

export default HomePage;