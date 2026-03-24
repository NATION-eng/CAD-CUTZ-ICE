import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) setIsMenuOpen(false);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Lookbook", path: "/styles" },
    { name: "Services", path: "/services" },
    { name: "Barbers", path: "/barbers" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <div className="logo-container">
          <span className="logo-main">CAD</span>
          <span className="logo-sub">CUTZ & ICE</span>
        </div>
      </Link>

      {/* --- DESKTOP VIEW --- */}
      {!isMobile && (
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/booking" className="btn-book-nav">
            BOOK NOW
          </Link>
        </div>
      )}

      {/* --- MOBILE HAMBURGER --- */}
      {isMobile && (
        <div className={`hamburger ${isMenuOpen ? "open" : ""}`} onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      )}

      {/* --- MOBILE OVERLAY --- */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link key={link.path} to={link.path} className="mobile-link">
            {link.name}
          </Link>
        ))}
        <Link to="/booking" className="btn-gold" style={{ marginTop: "2rem" }}>
          BOOK APPOINTMENT
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
