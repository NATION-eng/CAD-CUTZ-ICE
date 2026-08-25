import React from "react";
import { Link } from "react-router-dom";
import { LuxuryIcon } from "./LuxuryIcon";
import "./Hero.css";

const Hero: React.FC = () => {
  return (
    <header className="hero">
      <div className="hero-backdrop-glow" />
      <div className="container">
        <div className="hero-content">
          {/* Floating Pill Badge */}
          <div className="hero-badge">
            <span className="hero-pulse-dot" />
            <LuxuryIcon name="crown" size={13} color="#c5a059" />
            <span>PORT HARCOURT'S PREMIER LUXURY ATELIER</span>
          </div>

          <h1 className="hero-title">
            Crafting Confidence.
            <span className="gold-text">Elevating Style.</span>
          </h1>

          <p className="hero-subtext">
            Experience bespoke grooming where European razor precision meets modern style artistry. 
            Every appointment includes our signature scalp consultation and botanical hot towel ritual.
          </p>

          <div className="hero-actions">
            <Link to="/booking" className="btn-hero-primary">
              <LuxuryIcon name="sparkle" size={15} color="#000" />
              <span>RESERVE VIP SESSION</span>
            </Link>

            <Link to="/styles" className="btn-hero-secondary">
              <LuxuryIcon name="scissors" size={14} color="#c5a059" />
              <span>EXPLORE LOOKBOOK</span>
            </Link>
          </div>

          {/* Social Proof Strip */}
          <div className="hero-proof-strip">
            <div className="proof-item">
              <div className="proof-stars">
                {[...Array(5)].map((_, i) => (
                  <LuxuryIcon key={i} name="star" size={12} color="#c5a059" />
                ))}
              </div>
              <span>4.98 Rating</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-item">
              <LuxuryIcon name="lightning" size={13} color="#22c55e" />
              <span>Real-Time Digital Queue</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-item">
              <LuxuryIcon name="shield" size={13} color="#c5a059" />
              <span>5 Master Craftsmen</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
