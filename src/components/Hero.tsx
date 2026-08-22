import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const Hero: React.FC = () => {
  return (
    <header className="hero">
      <div className="container">
        <div className="hero-content">
          <span className="hero-Eyebrow">
            More Than a Cut. It’s a Statement.
          </span>
          <h1 className="hero-title">
            Don't just change your look.
            <span className="gold-text">Change your vibe.</span>
          </h1>
          <div className="hero-actions">
            <Link to="/booking">
              <button className="btn-gold">BOOK APPOINTMENT</button>
            </Link>

            <Link to="/barbers">
              <button className="btn-outline">MEET BARBERS</button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
