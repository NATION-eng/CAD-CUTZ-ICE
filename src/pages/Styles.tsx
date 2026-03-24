import React from "react";
import { useNavigate } from "react-router-dom";

const stylesList = [
  {
    id: 1,
    name: "The Skin Fade",
    description: "Ultra-clean transition from skin to hair.",
    img: "https://images.unsplash.com/photo-1621605815841-aa33c54431BB?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Classic Taper",
    description: "Professional and conservative graduated length.",
    img: "https://images.unsplash.com/photo-1599351431247-f5793384797d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Executive Contour",
    description: "Traditional side-parted style for professionals.",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Full Beard Sculpture",
    description: "Sharply lined and conditioned full beard.",
    img: "https://images.unsplash.com/photo-1532710093739-9470acff878f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Buzz Cut",
    description: "Uniform short length for a rugged look.",
    img: "https://images.unsplash.com/photo-1622286330291-49ef82467b7e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "Modern Mullet",
    description: "Short sides with a tapered, flowing back.",
    img: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 7,
    name: "Long Beard & Stache",
    description: "Natural growth with a groomed mustache.",
    img: "https://images.unsplash.com/photo-1475403131035-a73a50394f47?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 8,
    name: "360 Waves",
    description: "Deep textured waves with a sharp lineup.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 9,
    name: "Textured Crop",
    description: "Short fringe with a messy, textured top.",
    img: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 10,
    name: "Long Hair Man-Bun",
    description: "Polished look for long-haired clients.",
    img: "https://images.unsplash.com/photo-1617331140180-e8262094733a?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 11,
    name: "Slick Back Fade",
    description: "High shine with tight faded sides.",
    img: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 12,
    name: "Voluminous Quiff",
    description: "Maximum height and flow at the front.",
    img: "https://images.unsplash.com/photo-1622287198518-dfd1915324c1?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 13,
    name: "Short Afro Taper",
    description: "Natural curls with a soft temple taper.",
    img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 14,
    name: "Side Part Pompadour",
    description: "Classic lift with a hard razor part.",
    img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 15,
    name: "Salt and Pepper Crop",
    description: "Short texture for distinguished gray hair.",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 16,
    name: "Burst Fade Mohawk",
    description: "Curved fade around the ear with a central ridge.",
    img: "https://images.unsplash.com/photo-1605497787865-e6d4718b4781?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 17,
    name: "Flat Top",
    description: "Precise geometric shape and height.",
    img: "https://images.unsplash.com/photo-1592647420248-b74a218f9860?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 18,
    name: "Natural Temple Fade",
    description: "Clean edges for natural hair textures.",
    img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 19,
    name: "Braided Crown",
    description: "Intricate cornrows with a clean nape finish.",
    img: "https://images.unsplash.com/photo-1635273051937-60002f23908c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 20,
    name: "Pointed Ducktail Beard",
    description: "Groomed to a sharp point at the chin.",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 21,
    name: "Scissor Hand-Cut",
    description: "No clippers. Natural, soft finish all over.",
    img: "https://images.unsplash.com/photo-1593702295094-01582236a29e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 22,
    name: "Stubble Shadow",
    description: "Perfectly maintained '3-day' beard look.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
];

const Styles: React.FC = () => {
  const navigate = useNavigate();

  const handleStyleSelect = (styleName: string) => {
    // 1. Save selection
    localStorage.setItem("temp_selected_style", styleName);
    // 2. Navigate to /booking (Singular - matches App.tsx)
    navigate("/booking");
  };

  return (
    <div style={pageContainer}>
      <div style={headerSection}>
        <h2 className="serif" style={titleStyle}>
          The <span className="gold-text">Lookbook</span>
        </h2>
        <p style={{ color: "#888", maxWidth: "500px", margin: "1rem auto" }}>
          Explore our signature cuts. Select a style to begin your booking
          process.
        </p>
      </div>

      <div className="styles-grid">
        {stylesList.map((style) => (
          <div
            key={style.id}
            className="style-card"
            onClick={() => handleStyleSelect(style.name)}
          >
            <div className="style-image-wrapper">
              <img src={style.img} alt={style.name} className="style-img" />
              <div className="style-card-overlay">
                <span className="book-text">SELECT STYLE</span>
              </div>
            </div>
            <div style={styleInfo}>
              <h3 style={styleNameStyle}>{style.name}</h3>
              <p style={styleDescStyle}>{style.description}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .styles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; }
        .style-card { cursor: pointer; background: #0a0a0a; transition: 0.4s; }
        .style-image-wrapper { position: relative; height: 400px; overflow: hidden; border: 1px solid rgba(197, 160, 89, 0.1); }
        .style-img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%); transition: 0.8s cubic-bezier(0.25, 1, 0.5, 1); }
        .style-card:hover .style-img { filter: grayscale(0%); transform: scale(1.1); }
        .style-card-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.4s; }
        .style-card:hover .style-card-overlay { opacity: 1; }
        .book-text { color: white; border: 1px solid #c5a059; padding: 1rem 2rem; font-weight: bold; letter-spacing: 2px; background: rgba(0,0,0,0.6); }
        @media (max-width: 768px) { .style-image-wrapper { height: 350px; } }
      `}</style>
    </div>
  );
};

const pageContainer: React.CSSProperties = {
  padding: "150px 5% 80px",
  background: "#050505",
  minHeight: "100vh",
};
const headerSection: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "4rem",
};
const titleStyle: React.CSSProperties = {
  fontSize: "clamp(2.5rem, 8vw, 4rem)",
  marginBottom: "0.5rem",
  color: "white",
};
const styleInfo: React.CSSProperties = { marginTop: "1.5rem" };
const styleNameStyle: React.CSSProperties = {
  color: "white",
  fontSize: "1.5rem",
  marginBottom: "0.5rem",
  textTransform: "uppercase",
  letterSpacing: "1px",
};
const styleDescStyle: React.CSSProperties = {
  color: "#888",
  fontSize: "0.9rem",
  lineHeight: "1.5",
};

export default Styles;
