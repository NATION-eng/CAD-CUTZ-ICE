import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import { soundEffects } from "../utils/soundEffects";
import { LuxuryIcon } from "../components/LuxuryIcon";

interface StyleItem {
  id: number;
  name: string;
  category: "Fades & Tapers" | "Beard & Contour" | "Locs & Braids" | "Texture & Waves" | "Classic Cuts";
  description: string;
  img: string;
  tag: string;
}

export const stylesList: StyleItem[] = [
  {
    id: 1,
    name: "The Executive Contour",
    category: "Classic Cuts",
    description: "Traditional razor side-parting sculpted for executives and discerning gentlemen.",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    tag: "EXECUTIVE",
  },
  {
    id: 2,
    name: "Full Beard Sculpture",
    category: "Beard & Contour",
    description: "Crisply lined, steamed, and deeply conditioned full beard contour with botanical oils.",
    img: "https://images.unsplash.com/photo-1532710093739-9470acff878f?auto=format&fit=crop&w=800&q=80",
    tag: "BEARD",
  },
  {
    id: 3,
    name: "360 Deep Waves & Temple Taper",
    category: "Texture & Waves",
    description: "Deep spinning wave compression topped with temple razor fade and sharp boundary.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    tag: "POPULAR",
  },
  {
    id: 4,
    name: "Precision Skin Fade",
    category: "Fades & Tapers",
    description: "Ultra-clean seamless razor transition from bare skin to textured top length.",
    img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
    tag: "SIGNATURE",
  },
  {
    id: 5,
    name: "Side-Part Pompadour",
    category: "Classic Cuts",
    description: "High-volume textured lift with clean razor boundary and low neck taper.",
    img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
    tag: "TIMELESS",
  },
  {
    id: 6,
    name: "Slick Back High Fade",
    category: "Classic Cuts",
    description: "High shine pomade finish with high skin fade contrast and straight edge.",
    img: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80",
    tag: "LUXURY",
  },
  {
    id: 7,
    name: "Pointed Ducktail Beard",
    category: "Beard & Contour",
    description: "Precision angled tapering to a sharp, regal chin profile with razor lines.",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    tag: "SCULPTED",
  },
  {
    id: 8,
    name: "Salt & Pepper Distinguished Crop",
    category: "Texture & Waves",
    description: "Short textured scissor crop celebrating natural silver tones with crisp edges.",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    tag: "DISTINGUISHED",
  },
  {
    id: 9,
    name: "Stubble Shadow & Sharp Lineup",
    category: "Beard & Contour",
    description: "Perfect 3-day stubble boundary with laser-sharp cheek and neck borders.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    tag: "CLEAN",
  },
  {
    id: 10,
    name: "Classic Low Taper Fade",
    category: "Fades & Tapers",
    description: "Conservative, professional graduated temple and neckline taper.",
    img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80",
    tag: "CLASSIC",
  },
  {
    id: 11,
    name: "Textured French Crop",
    category: "Texture & Waves",
    description: "Forward layered fringe with blunted edge and high skin fade.",
    img: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80",
    tag: "MODERN",
  },
  {
    id: 12,
    name: "Burst Fade Fohawk",
    category: "Fades & Tapers",
    description: "Circular ear fade contour with textured center crest and crisp temple line.",
    img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
    tag: "TRENDING",
  },
  {
    id: 13,
    name: "Afro Temple Taper",
    category: "Texture & Waves",
    description: "Full natural volumetric crown with clean temple and nape drop fade.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    tag: "ICONIC",
  },
  {
    id: 14,
    name: "Architectural Dreadlock Barrel Rows",
    category: "Locs & Braids",
    description: "Intricately woven locs secured in sleek symmetrical geometric cornrows.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    tag: "MASTER LOCS",
  },
  {
    id: 15,
    name: "Boxer Braids with Clean Parting",
    category: "Locs & Braids",
    description: "Flawless parallel twin braids feeding back to nape with razor-clean scalp grid.",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    tag: "BRAIDS",
  },
  {
    id: 16,
    name: "Loc Retwist with Freestyle Geometry",
    category: "Locs & Braids",
    description: "Fresh palm-roll maintenance finished with custom razor art etched into the neckline.",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    tag: "SIGNATURE",
  },
  {
    id: 17,
    name: "High Loc Crown with Drop Fade",
    category: "Locs & Braids",
    description: "Voluminous locs tied high into an executive top knot surrounded by a smooth taper.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    tag: "POPULAR",
  },
  {
    id: 18,
    name: "Short Textured Locs with Mid Fade",
    category: "Locs & Braids",
    description: "Clean starter or shoulder locs with mid-level skin graduation and edge enhancement.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    tag: "VERSATILE",
  },
  {
    id: 19,
    name: "Two-Strand Twist with Temple Fade",
    category: "Locs & Braids",
    description: "Defined two-strand rope twists with sharp frontal alignment and temple taper.",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    tag: "TWISTS",
  },
  {
    id: 20,
    name: "Spider Web Braid Crown",
    category: "Locs & Braids",
    description: "Complex artisanal mandala pattern centered from crown with razor perimeter.",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    tag: "EXCLUSIVE",
  },
  {
    id: 21,
    name: "Low Loc Ponytail with Razor Lineup",
    category: "Locs & Braids",
    description: "Sleek low-tied loc arrangement with surgical razor edge enhancement.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    tag: "EXECUTIVE",
  },
  {
    id: 22,
    name: "Micro-Locs with Bald Fade",
    category: "Locs & Braids",
    description: "Densely packed fine micro-locs with high-contrast razor bald fade on perimeter.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    tag: "LUXURY",
  },
];

const CATEGORIES = [
  "All",
  "Fades & Tapers",
  "Beard & Contour",
  "Locs & Braids",
  "Texture & Waves",
  "Classic Cuts",
] as const;

const Styles: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredStyles = useMemo(() => {
    return stylesList.filter((item) => {
      const matchCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleStyleSelect = (styleName: string) => {
    soundEffects.playSoftClick();
    localStorage.setItem("temp_selected_style", styleName);
    navigate("/booking");
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Modern Header */}
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
            <span>22 SIGNATURE ARTISANAL CUTS</span>
          </div>

          <h1 className="serif" style={{ margin: "0 0 1rem", fontSize: "clamp(2.4rem, 6vw, 4rem)" }}>
            The Atelier <span className="gold-text italic">Lookbook</span>
          </h1>
          <p style={{ color: "#888", maxWidth: "620px", margin: "0 auto", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Browse our signature portfolio of precision cuts, loc artistry, and beard contours. Tap any style to automatically pre-select it in your VIP booking wizard.
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
                  setSelectedCategory(cat);
                }}
                style={{
                  background: selectedCategory === cat ? "var(--gold-gradient)" : "rgba(255, 255, 255, 0.04)",
                  color: selectedCategory === cat ? "#000" : "#aaa",
                  border: selectedCategory === cat ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
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

          {/* Search Input */}
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: "280px" }}>
            <input
              type="text"
              placeholder="Search style or cut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Lookbook Grid */}
        {filteredStyles.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", border: "1px dashed #333", borderRadius: "12px", color: "#888", background: "#0c0c0c" }}>
            No styles match "{searchQuery}". Try browsing all categories.
          </div>
        ) : (
          <div className="responsive-card-grid">
            {filteredStyles.map((style) => (
              <div
                key={style.id}
                className="card-luxury"
                onClick={() => handleStyleSelect(style.name)}
                style={{
                  padding: 0,
                  cursor: "pointer",
                  background: "#0c0c0c",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "14px",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Image Frame */}
                <div style={{ position: "relative", height: "360px", overflow: "hidden", background: "#111" }}>
                  <SafeImage
                    src={style.img}
                    alt={style.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "grayscale(100%)",
                      transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    className="style-cover-img"
                  />

                  {/* Badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      background: "rgba(5, 5, 5, 0.85)",
                      backdropFilter: "blur(8px)",
                      color: "#c5a059",
                      border: "1px solid rgba(197, 160, 89, 0.35)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      letterSpacing: "1.5px",
                    }}
                  >
                    {style.tag}
                  </span>

                  {/* Hover Overlay */}
                  <div
                    className="style-overlay"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(5, 5, 5, 0.65)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <span className="btn-gold" style={{ padding: "12px 24px", fontSize: "0.75rem", gap: "6px" }}>
                      <LuxuryIcon name="sparkle" size={14} color="#000" />
                      RESERVE THIS STYLE
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                  <div>
                    <span style={{ fontSize: "0.68rem", color: "#c5a059", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 }}>
                      {style.category}
                    </span>
                    <h3 style={{ fontSize: "1.15rem", color: "#fff", margin: "4px 0 6px", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                      {style.name}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "#888", lineHeight: 1.5, margin: 0 }}>
                      {style.description}
                    </p>
                  </div>

                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "#c5a059", fontWeight: 700, letterSpacing: "0.5px" }}>
                      1-Tap VIP Selection →
                    </span>
                    <LuxuryIcon name="sparkle" size={12} color="#c5a059" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .card-luxury:hover {
          border-color: rgba(197, 160, 89, 0.5) !important;
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(197,160,89,0.15);
        }
        .card-luxury:hover .style-cover-img {
          filter: grayscale(0%) !important;
          transform: scale(1.06);
        }
        .card-luxury:hover .style-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default Styles;
