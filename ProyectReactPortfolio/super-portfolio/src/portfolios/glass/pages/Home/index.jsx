// @ts-nocheck
import React from 'react';
import HeroSection from './HeroSection';
import SkillsHighlight from './SkillBadge';
import RecentWorkPreview from './RecentWorkPreview';
import CallToAction from './CallToAction';
import styles from '../../styles/pages/HomePage.module.css'; // Create HomePage.module.css

function HomePage() {
  return (
    <div className={styles.homePage}>
      <HeroSection />
      <SkillsHighlight />
      <RecentWorkPreview />
      <CallToAction />
    </div>
  );
}

export default HomePage;