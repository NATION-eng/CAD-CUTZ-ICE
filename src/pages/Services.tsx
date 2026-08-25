import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SERVICES_CATALOG } from "../data/salonData";
import { soundEffects } from "../utils/soundEffects";
import { LuxuryIcon } from "../components/LuxuryIcon";
import type { ServiceItem } from "../types";

const CATEGORIES = [
  "All",
  "Barbering",
  "Beard & Shave",
  "Treatments & Color",
  "Dreadlocks",
  "Nails & Pedicure",
  "Young Gentlemen",
] as const;

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const filteredServices = useMemo(() => {
    return SERVICES_CATALOG.filter((item) => {
      const matchCat =
        activeCategory === "All" || item.category === activeCategory;
      const matchQuery =
        item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchFilter.toLowerCase()) ?? false);
      return matchCat && matchQuery;
    });
  }, [activeCategory, searchFilter]);

  const groupedServices = useMemo(() => {
    const groups: { [cat: string]: ServiceItem[] } = {};
    filteredServices.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
    }));
  }, [filteredServices]);

  const handleBookService = (serviceName: string) => {
    soundEffects.playSoftClick();
    localStorage.setItem("temp_selected_style", serviceName);
    navigate("/booking");
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.8rem" }}>
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
            <LuxuryIcon name="scissors" size={13} color="#c5a059" />
            <span>PRICE TARIFF & EXPERIENCES</span>
          </div>

          <h1 className="serif" style={{ margin: "0 0 1rem", fontSize: "clamp(2.4rem, 6vw, 4rem)" }}>
            The Service <span className="gold-text italic">Menu</span>
          </h1>
          <p style={{ color: "#888", maxWidth: "620px", margin: "0 auto", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Masterfully curated treatments for the modern gentleman. Every service includes our signature consultation, hair wash, and hot towel botanical finish.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2.5rem",
            background: "rgba(14, 14, 14, 0.8)",
            backdropFilter: "blur(14px)",
            padding: "12px 18px",
            borderRadius: "14px",
            border: "1px solid rgba(197, 160, 89, 0.2)",
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", maxWidth: "100%", paddingBottom: "4px", WebkitOverflowScrolling: "touch" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  soundEffects.playSoftClick();
                  setActiveCategory(cat);
                }}
                style={{
                  background: activeCategory === cat ? "var(--gold-gradient)" : "rgba(255, 255, 255, 0.04)",
                  color: activeCategory === cat ? "#000" : "#aaa",
                  border: activeCategory === cat ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "7px 16px",
                  borderRadius: "20px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ flex: "1 1 180px", maxWidth: "260px" }}>
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: "100%",
                background: "#050505",
                border: "1px solid rgba(197, 160, 89, 0.3)",
                padding: "9px 16px",
                color: "#fff",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Grouped Service Menu */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {groupedServices.map((group) => (
            <div key={group.category}>
              {/* Category Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "1.2rem",
                  borderBottom: "1px solid rgba(197, 160, 89, 0.2)",
                  paddingBottom: "10px",
                }}
              >
                <LuxuryIcon name="scissors" size={18} color="#c5a059" />
                <h3 className="serif italic" style={{ fontSize: "1.4rem", color: "#c5a059", margin: 0, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  {group.category}
                </h3>
              </div>

              {/* Service Items Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="service-row-card"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      background: "#0c0c0c",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "10px",
                      transition: "all 0.25s ease",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ flex: "1 1 300px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h4 style={{ color: "#fff", fontSize: "1.05rem", margin: 0, fontWeight: 700 }}>
                          {item.name}
                        </h4>
                        {item.duration > 0 && (
                          <span style={{ fontSize: "0.7rem", color: "#888", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <LuxuryIcon name="clock" size={11} color="#888" />
                            {item.duration}m
                          </span>
                        )}
                        {item.popular && (
                          <span className="badge-gold" style={{ fontSize: "0.58rem", padding: "2px 6px" }}>
                            TOP PICK
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p style={{ fontSize: "0.82rem", color: "#777", margin: "4px 0 0", lineHeight: 1.4 }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.4rem" }}>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#22c55e", fontFamily: "'Montserrat', sans-serif" }}>
                        {item.note || `₦${item.price.toLocaleString()}`}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookService(item.name)}
                        className="btn-gold"
                        style={{
                          padding: "8px 18px",
                          fontSize: "0.72rem",
                          letterSpacing: "1px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        RESERVE SEAT →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Policy Box */}
        <div
          style={{
            marginTop: "4.5rem",
            padding: "clamp(20px, 4vw, 36px)",
            border: "1px solid rgba(197, 160, 89, 0.25)",
            background: "rgba(197, 160, 89, 0.04)",
            borderRadius: "14px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#aaa", fontSize: "0.88rem", fontStyle: "italic", margin: "0 auto 1rem", maxWidth: "700px", lineHeight: 1.6 }}>
            "To preserve the integrity and precision of our craft, all salon accounts are settled digitally or at the central concierge terminal. Direct cash tipping to staff is welcome via digital QR."
          </p>
          <span style={{ color: "#c5a059", letterSpacing: "2.5px", fontSize: "0.78rem", fontWeight: 800 }}>
            — CAD CUTZ & ICE MANAGEMENT —
          </span>
        </div>
      </div>

      <style>{`
        .service-row-card:hover {
          border-color: rgba(197, 160, 89, 0.4) !important;
          background: #111 !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Services;
