import React from "react";
import { Link } from "react-router-dom";
import { LuxuryIcon } from "./LuxuryIcon";

const Footer: React.FC = () => {
  return (
    <footer style={{ background: "#040404", borderTop: "1px solid rgba(197, 160, 89, 0.2)", padding: "clamp(40px, 6vw, 70px) 4% 30px", color: "#888" }}>
      <div className="container" style={{ maxWidth: "1240px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "3rem",
            marginBottom: "3rem",
          }}
        >
          {/* Col 1: Brand */}
          <div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 900, color: "#fff", letterSpacing: "2px" }}>
              CAD CUTZ <span style={{ color: "#c5a059" }}>& ICE</span>
            </span>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, marginTop: "12px", color: "#777" }}>
              A sanctuary of male refinement where classic European grooming meets modern artisanal precision.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <Link
                to="/admin"
                style={{
                  fontSize: "0.72rem",
                  color: "#c5a059",
                  textDecoration: "none",
                  border: "1px solid rgba(197, 160, 89, 0.3)",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  letterSpacing: "1px",
                }}
              >
                <LuxuryIcon name="shield" size={12} color="#c5a059" />
                Staff Atelier Portal →
              </Link>
            </div>
          </div>

          {/* Col 2: Operating Schedule */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "0.85rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <LuxuryIcon name="clock" size={14} color="#c5a059" />
              Atelier Hours
            </h4>
            <div style={{ fontSize: "0.82rem", lineHeight: 1.8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Mon – Fri:</span>
                <span style={{ color: "#ddd" }}>9:00 AM – 9:00 PM</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Saturday:</span>
                <span style={{ color: "#ddd" }}>5:00 PM – 10:00 PM</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Sunday:</span>
                <span style={{ color: "#c5a059" }}>8:30 PM – 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "0.85rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "1rem" }}>
              Experiences
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.82rem", lineHeight: 2 }}>
              <li><Link to="/booking" style={{ color: "#888", textDecoration: "none" }}>Reserve Appointment</Link></li>
              <li><Link to="/services" style={{ color: "#888", textDecoration: "none" }}>Service Catalog</Link></li>
              <li><Link to="/styles" style={{ color: "#888", textDecoration: "none" }}>The Lookbook (22 Styles)</Link></li>
              <li><Link to="/queue" style={{ color: "#888", textDecoration: "none" }}>Live Salon Queue</Link></li>
              <li><Link to="/barbers" style={{ color: "#888", textDecoration: "none" }}>Master Artisans</Link></li>
            </ul>
          </div>

          {/* Col 4: Concierge Contact */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "0.85rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <LuxuryIcon name="location" size={14} color="#c5a059" />
              Concierge
            </h4>
            <p style={{ fontSize: "0.8rem", lineHeight: 1.5, color: "#888" }}>
              Egbelu-ogbogoro road Opp. SDA Church Egbelu-Mgbaraja, Ogbogoro Town, Obio/Akpor LGA, Port Harcourt.
            </p>
            <p style={{ fontSize: "0.85rem", color: "#c5a059", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <LuxuryIcon name="phone" size={14} color="#c5a059" />
              08116079309
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.75rem",
          }}
        >
          <span>© {new Date().getFullYear()} CAD CUTZ & ICE. All Rights Reserved.</span>
          <span style={{ color: "#555" }}>Crafted for Discerning Gentlemen</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
