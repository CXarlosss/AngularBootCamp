// @ts-nocheck
import { labs } from "../experiments/labs.config";
import PlaygroundCard from "../components/PlaygroundCard";
import styles from "../styles/playground.labs.module.css";

const Labs = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Experimental Labs</h1>

      <p className={styles.subtitle}>
        A collection of controlled UI experiments designed to test layout
        systems, animation patterns and scalable visual structures.
      </p>

     <div className={styles.grid}>
  {labs.map((lab) => (
    <PlaygroundCard
      key={lab.id}
      title={lab.title}
      description={lab.description}
      link={`/portfolio/css-playground/labs/${lab.path}`}
    />
  ))}
</div>

    </div>
  );
};

export default Labs;
