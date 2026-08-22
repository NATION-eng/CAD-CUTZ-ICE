import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SERVICES_CATALOG } from "../data/salonData";
import { soundEffects } from "../utils/soundEffects";
import { LuxuryIcon } from "../components/LuxuryIcon";

const CATEGORIES = [
  "All",
  "Barbering",
  "Beard & Shave",
  "Treatments & Color",
  "Dreadlocks",
  "Nails & Pedicure",
  "Young Gentlemen",
  "Amenities",
];

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");

  const filteredServices = useMemo(() => {
    return SERVICES_CATALOG.filter((item) => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchFilter]);

  // Group by category if "All" is active
  const groupedServices = useMemo(() => {
    if (activeCategory !== "All") {
      return [{ category: activeCategory, items: filteredServices }];
    }
    const categoriesPresent = Array.from(new Set(filteredServices.map((s) => s.category)));
    return categoriesPresent.map((cat) => ({
      category: cat,
      items: filteredServices.filter((s) => s.category === cat),
    }));
  }, [activeCategory, filteredServices]);

  const handleBookService = (serviceName: string) => {
    soundEffects.playSoftClick();
    localStorage.setItem("temp_selected_style", serviceName);
    navigate("/booking");
  };

  return (
    <div style={{ padding: "140px 6% 90px", background: "#050505", minHeight: "100vh", color: "#fff" }}>
      <div className="container" style={{ maxWidth: "1140px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span className="eyebrow">CAD CUTZ & ICE • PRICE TARIFF</span>
          <h1 className="serif" style={{ fontSize: "clamp(2.5rem, 6vw, 4.2rem)", margin: "0 0 1rem" }}>
            The <span className="gold-text italic">Service Menu</span>
          </h1>
          <p style={{ color: "#888", maxWidth: "620px", margin: "0 auto", fontSize: "0.95rem" }}>
            Masterfully curated treatments for the modern gentleman. Every service includes our signature consultation and hot towel finish.
          </p>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.2rem",
            marginBottom: "3.5rem",
            background: "#0c0c0c",
            padding: "16px 20px",
            borderRadius: "10px",
            border: "1px solid rgba(197, 160, 89, 0.2)",
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", maxWidth: "100%", paddingBottom: "4px" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  soundEffects.playSoftClick();
                  setActiveCategory(cat);
                }}
                style={{
                  background: activeCategory === cat ? "var(--gold-gradient)" : "transparent",
                  color: activeCategory === cat ? "#000" : "#aaa",
                  border: activeCategory === cat ? "none" : "1px solid #222",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ minWidth: "220px" }}>
            <input
              type="text"
              placeholder="Search services..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: "100%",
                background: "#050505",
                border: "1px solid rgba(197, 160, 89, 0.3)",
                padding: "8px 14px",
                color: "#fff",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Grouped Service Menu */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
          {groupedServices.map((group) => (
            <div key={group.category}>
              {/* Category Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "1.8rem",
                  borderBottom: "1px solid rgba(197, 160, 89, 0.2)",
                  paddingBottom: "10px",
                }}
              >
                <LuxuryIcon name="scissors" size={20} color="#c5a059" />
                <h3 className="serif italic" style={{ fontSize: "1.5rem", color: "#c5a059", margin: 0, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  {group.category}
                </h3>
              </div>

              {/* Service Items Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="service-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      background: "#0c0c0c",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ flex: "1 1 300px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h4 style={{ color: "#fff", fontSize: "1.05rem", margin: 0, fontWeight: 600 }}>
                          {item.name}
                        </h4>
                        {item.duration > 0 && (
                          <span style={{ fontSize: "0.7rem", color: "#888", background: "#161616", padding: "2px 8px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
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

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#c5a059", fontFamily: "'Playfair Display', serif" }}>
                        {item.note || `₦${item.price.toLocaleString()}`}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookService(item.name)}
                        className="btn-book-action"
                        style={{
                          background: "transparent",
                          border: "1px solid #c5a059",
                          color: "#c5a059",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: "1px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          whiteSpace: "nowrap",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "var(--gold-gradient)";
                          e.currentTarget.style.color = "#000";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#c5a059";
                        }}
                      >
                        BOOK THIS →
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
            marginTop: "5rem",
            padding: "2.5rem",
            border: "1px solid rgba(197, 160, 89, 0.3)",
            background: "rgba(197, 160, 89, 0.03)",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#aaa", fontSize: "0.88rem", fontStyle: "italic", margin: "0 auto 1rem", maxWidth: "700px" }}>
            "To preserve the integrity and precision of our craft, all salon accounts are settled digitally or at the central concierge terminal. Direct cash tipping to staff is welcome via digital QR."
          </p>
          <span style={{ color: "#c5a059", letterSpacing: "3px", fontSize: "0.8rem", fontWeight: 700 }}>
            — CAD CUTZ & ICE MANAGEMENT —
          </span>
        </div>
      </div>
    </div>
  );
};

export default Services;
