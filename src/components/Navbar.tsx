import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { soundEffects } from "../utils/soundEffects";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    soundEffects.playSoftClick();
    setIsMenuOpen((prev) => !prev);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Lookbook", path: "/styles" },
    { name: "Services", path: "/services" },
    { name: "Artisans", path: "/barbers" },
    { name: "Live Queue", path: "/queue", hasDot: true },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      {/* Brand Logo */}
      <Link to="/" className="logo-container" onClick={() => soundEffects.playSoftClick()}>
        <span className="logo-main">CAD</span>
        <span className="logo-sub">CUTZ & ICE</span>
      </Link>

      {/* --- DESKTOP VIEW --- */}
      <div className="nav-links">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          if (link.hasDot) {
            return (
              <Link
                key={link.path}
                to={link.path}
                className="nav-queue-pill"
                onClick={() => soundEffects.playSoftClick()}
              >
                <span className="queue-dot"></span>
                <span>{link.name}</span>
              </Link>
            );
          }
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive ? "active" : ""}`}
              onClick={() => soundEffects.playSoftClick()}
            >
              {link.name}
            </Link>
          );
        })}
        <Link
          to="/booking"
          className="btn-book-nav"
          onClick={() => soundEffects.playSoftClick()}
        >
          BOOK APPOINTMENT
        </Link>
      </div>

      {/* --- MOBILE HAMBURGER --- */}
      <button
        className={`hamburger ${isMenuOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        type="button"
      >
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </button>

      {/* --- MOBILE OVERLAY DRAWER --- */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`mobile-link ${location.pathname === link.path ? "active" : ""}`}
            onClick={() => soundEffects.playSoftClick()}
          >
            {link.name}
          </Link>
        ))}
        <Link
          to="/booking"
          className="btn-gold"
          style={{ marginTop: "1.5rem" }}
          onClick={() => soundEffects.playSoftClick()}
        >
          BOOK APPOINTMENT
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
