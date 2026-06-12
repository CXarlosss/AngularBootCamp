// @ts-nocheck
import PlaygroundCard from "../components/PlaygroundCard";
import PlaygroundGrid from "../components/PlaygroundGrid";
import { labs } from "../experiments/labs.config";
import "../styles/playground.home.module.css";
const Home = () => {
  return (
    <>
      <section className="play-hero">
        <h1 className="play-title">
          CSS <span>Playground</span>
        </h1>

        <p className="play-subtitle">
          Experimental environment for advanced layout systems,
          animation architecture and performance-driven UI.
        </p>

        <div className="play-intro">
          <p>
            Created by <strong>Carlos De Petronila</strong>, Full Stack
            Developer specialized in React, Next.js and scalable frontend
            architectures.
          </p>

          <p>
            This lab is used to prototype and validate visual systems before
            integrating them into production projects.
          </p>
        </div>
      </section>

      <section className="play-section">
        <h2 className="play-section-title">Interactive Experiments</h2>

        <PlaygroundGrid>
          {labs.map((lab) => (
            <PlaygroundCard
              key={lab.id}
              title={lab.title}
              description={lab.description}
              link={`/portfolio/css-playground/labs/${lab.path}`}
            />
          ))}
        </PlaygroundGrid>
      </section>
    </>
  );
};

export default Home;
