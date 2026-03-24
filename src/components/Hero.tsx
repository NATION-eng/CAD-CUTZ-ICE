import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";
import { buildImageSources, createPlaceholderDataUrl } from "../utils/imageFallbacks";

const heroSources = buildImageSources(
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=2074&q=80",
  "Signature Cuts",
  [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=2074&q=80",
    "https://images.unsplash.com/photo-1599351431247-f5793384797d?auto=format&fit=crop&w=2074&q=80",
  ],
);

const Hero: React.FC = () => {
  const [backgroundImage, setBackgroundImage] = useState(createPlaceholderDataUrl("Signature Cuts"));

  useEffect(() => {
    let active = true;

    const tryLoad = (index: number) => {
      if (index >= heroSources.length) return;

      const candidate = heroSources[index];
      const image = new Image();
      image.onload = () => {
        if (active) setBackgroundImage(candidate);
      };
      image.onerror = () => {
        if (active) tryLoad(index + 1);
      };
      image.src = candidate;
    };

    tryLoad(0);

    return () => {
      active = false;
    };
  }, []);

  return (
    <header
      className="hero"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0.4) 50%, rgba(5,5,5,1) 100%), url("${backgroundImage}")`,
      }}
    >
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
