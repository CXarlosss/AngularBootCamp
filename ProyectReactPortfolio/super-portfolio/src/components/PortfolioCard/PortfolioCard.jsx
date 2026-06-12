// @ts-nocheck
import { Link } from "react-router-dom";
import "./PortfolioCard.css";

const PortfolioCard = ({ portfolio }) => {
  return (
    <Link to={`/portfolio/${portfolio.id}`} className="portfolio-card">
      <div className="card-visual">
        <div className="visual-overlay"></div>
      </div>

      <div className="card-content">
        <h3>{portfolio.title}</h3>
        <p>{portfolio.description}</p>

        <span className="card-link">
          Explore →
        </span>
      </div>
    </Link>
  );
};

export default PortfolioCard;
