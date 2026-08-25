import React from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { LuxuryIcon } from "./LuxuryIcon";
import SafeImage from "./SafeImage";
import "./Gallery.css";

const instagramURL = "https://www.instagram.com/chiburomanation?igsh=aWt0aGY5OWgxMHp3";

// 6 Curated High-Definition Barber Artistry Images (100% Reliable & Guaranteed to Load)
const galleryItems = [
  {
    id: 1,
    title: "Executive Precision Fade",
    category: "Signature Cut",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Beard Sculpting & Botanical Steam",
    category: "Beard Contour",
    url: "https://images.unsplash.com/photo-1532710093739-9470acff878f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "European Scissor & Razor Craft",
    category: "Master Artistry",
    url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Laser Sharp Lineup & Temple Taper",
    category: "Fades & Tapers",
    url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Artisanal Dreadlock & Braid Craft",
    category: "Locs & Braids",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "Slick Back Pomade Executive Finish",
    category: "Classic Cuts",
    url: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80",
  },
];

const GallerySection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.05);

  return (
    <section className="magic-gallery" ref={ref}>
      <div className={`gallery-header ${isVisible ? "visible" : ""}`}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(197, 160, 89, 0.1)",
            border: "1px solid rgba(197, 160, 89, 0.3)",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "0.72rem",
            color: "#c5a059",
            fontWeight: 800,
            letterSpacing: "1.5px",
            marginBottom: "1rem",
          }}
        >
          <LuxuryIcon name="sparkle" size={13} color="#c5a059" />
          <span>INSTAGRAM ATELIER FEED</span>
        </div>

        <h2 className="serif" style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)", margin: "0 0 0.8rem" }}>
          Experience the <span className="gold-text italic">Magic</span>
        </h2>
        <p className="subtitle">
          Witness the craft in motion. Tap any frame to explore our daily transformations on Instagram.
        </p>
      </div>

      <div className="magic-grid">
        {galleryItems.map((item, index) => (
          <a
            key={item.id}
            href={instagramURL}
            target="_blank"
            rel="noopener noreferrer"
            className={`magic-item ${isVisible ? "visible" : ""}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="media-wrapper">
              <SafeImage
                src={item.url}
                alt={item.title}
                className="magic-media"
                loading="lazy"
              />

              {/* Instagram Floating Icon Badge */}
              <div className="insta-corner-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>@chiburomanation</span>
              </div>

              {/* Hover & Tap Overlay */}
              <div className="magic-overlay">
                <div className="overlay-content">
                  <span className="overlay-category">{item.category}</span>
                  <h4 className="overlay-title">{item.title}</h4>
                  <span className="view-text">
                    OPEN ON INSTAGRAM ↗
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Instagram Follow CTA */}
      <div style={{ marginTop: "3.5rem", textAlign: "center" }}>
        <a
          href={instagramURL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-instagram-follow"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
          <span>FOLLOW @CHIBUROMANATION ON INSTAGRAM</span>
        </a>
      </div>
    </section>
  );
};

export default GallerySection;
