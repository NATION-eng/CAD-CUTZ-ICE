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
    description: "Forward French fringe with point-cut matte textured crown and mid fade.",
    img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    tag: "MODERN",
  },
  {
    id: 12,
    name: "Artisanal Scissor Hand-Cut",
    category: "Classic Cuts",
    description: "Pure shear precision haircut without clippers for natural organic flow.",
    img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    tag: "HANDCRAFTED",
  },
  {
    id: 13,
    name: "Executive Caesar Cut",
    category: "Classic Cuts",
    description: "Short horizontal fringe with neat even perimeter and polished finish.",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    tag: "REFINED",
  },
  {
    id: 14,
    name: "Modern Mullet & Temple Taper",
    category: "Fades & Tapers",
    description: "Contemporary textured flow at the nape with clean temple transitions.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    tag: "TRENDING",
  },
  {
    id: 15,
    name: "Afro Hair Re-Locking & Shine",
    category: "Locs & Braids",
    description: "Full head dread retwist, root maintenance, and organic coconut oil set.",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    tag: "DREADLOCKS",
  },
  {
    id: 16,
    name: "Long Beard & Mustache Styling",
    category: "Beard & Contour",
    description: "Full organic growth groomed and styled with beeswax balm and hot comb.",
    img: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80",
    tag: "RUGGED",
  },
  {
    id: 17,
    name: "Burst Fade Mohawk",
    category: "Fades & Tapers",
    description: "Curved dynamic fade around the ear with a bold central textured ridge.",
    img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
    tag: "DYNAMIC",
  },
  {
    id: 18,
    name: "High Fade Re-Locking",
    category: "Locs & Braids",
    description: "High-top dreadlocks retwist accompanied by razor skin taper fade.",
    img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    tag: "LOCS",
  },
  {
    id: 19,
    name: "Short Afro Temple Taper",
    category: "Texture & Waves",
    description: "Natural organic curls with soft temple taper and defined forehead line.",
    img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=800&q=80",
    tag: "NATURAL",
  },
  {
    id: 20,
    name: "Textured Crop Fringe",
    category: "Texture & Waves",
    description: "Choppy matte texturing on top with tight drop fade around ears.",
    img: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=800&q=80",
    tag: "URBAN",
  },
  {
    id: 21,
    name: "Braided Crown & Nape Taper",
    category: "Locs & Braids",
    description: "Geometric cornrow braiding finished with razor sharp perimeter lines.",
    img: "https://images.unsplash.com/photo-1475403131035-a73a50394f47?auto=format&fit=crop&w=800&q=80",
    tag: "ARTISANAL",
  },
  {
    id: 22,
    name: "Voluminous Textured Quiff",
    category: "Classic Cuts",
    description: "Maximum front height and flow with tapered side contours.",
    img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    tag: "PRESTIGE",
  },
];

const CATEGORIES = ["All", "Fades & Tapers", "Beard & Contour", "Texture & Waves", "Locs & Braids", "Classic Cuts"];

const Styles: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStyles = useMemo(() => {
    return stylesList.filter((style) => {
      const matchCat = selectedCategory === "All" || style.category === selectedCategory;
      const matchSearch =
        style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        style.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleStyleSelect = (styleName: string) => {
    soundEffects.playSoftClick();
    localStorage.setItem("temp_selected_style", styleName);
    navigate("/booking");
  };

  return (
    <div style={{ padding: "140px 6% 90px", background: "#050505", minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: "1360px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span className="eyebrow">THE ATELIER LOOKBOOK</span>
          <h1 className="serif" style={{ fontSize: "clamp(2.5rem, 6vw, 4.2rem)", margin: "0 0 1rem" }}>
            Curated <span className="gold-text italic">Signature Cuts</span>
          </h1>
          <p style={{ color: "#888", maxWidth: "600px", margin: "0 auto", fontSize: "0.95rem" }}>
            Explore our master portfolio of 22 bespoke cuts. Click any style to automatically pre-fill your booking session.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.2rem",
            marginBottom: "3rem",
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
                  setSelectedCategory(cat);
                }}
                style={{
                  background: selectedCategory === cat ? "var(--gold-gradient)" : "transparent",
                  color: selectedCategory === cat ? "#000" : "#aaa",
                  border: selectedCategory === cat ? "none" : "1px solid #222",
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

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: "240px" }}>
            <input
              type="text"
              placeholder="Search style or cut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Lookbook Grid */}
        {filteredStyles.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", border: "1px dashed #333", borderRadius: "10px", color: "#888" }}>
            No styles match your search criteria. Try a different query.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: "2.5rem",
            }}
          >
            {filteredStyles.map((style) => (
              <div
                key={style.id}
                className="card-luxury"
                onClick={() => handleStyleSelect(style.name)}
                style={{
                  padding: 0,
                  cursor: "pointer",
                  background: "#0c0c0c",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px",
                  overflow: "hidden",
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
                      top: "16px",
                      left: "16px",
                      background: "rgba(5, 5, 5, 0.85)",
                      backdropFilter: "blur(8px)",
                      color: "#c5a059",
                      border: "1px solid rgba(197, 160, 89, 0.3)",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      letterSpacing: "2px",
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
                      SELECT FOR BOOKING
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: "20px" }}>
                  <span style={{ fontSize: "0.68rem", color: "#c5a059", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>
                    {style.category}
                  </span>
                  <h3 style={{ fontSize: "1.2rem", color: "#fff", margin: "6px 0 8px", fontFamily: "'Playfair Display', serif" }}>
                    {style.name}
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "#888", lineHeight: 1.5, margin: 0 }}>
                    {style.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
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
