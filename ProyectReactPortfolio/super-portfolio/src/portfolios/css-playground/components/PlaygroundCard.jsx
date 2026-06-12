// @ts-nocheck
import { Link } from "react-router-dom";

const PlaygroundCard = ({ title, description, link }) => {
  return (
    <div className="play-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={link} className="play-button">
        Enter Lab
      </Link>
    </div>
  );
};

export default PlaygroundCard;
