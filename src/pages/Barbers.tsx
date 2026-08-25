import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ARTISANS } from "../data/salonData";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { soundEffects } from "../utils/soundEffects";
import { LuxuryIcon } from "../components/LuxuryIcon";

const Barbers: React.FC = () => {
  const navigate = useNavigate();
  const [occupiedBarbers, setOccupiedBarbers] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, "bookings"), where("status", "==", "in-chair"));
    const unsub = onSnapshot(q, (snapshot) => {
      const busy = snapshot.docs.map((d) => d.data().artisan);
      setOccupiedBarbers(busy);
    });
    return () => unsub();
  }, []);

  const handleBookWithArtisan = (artisanName: string) => {
    soundEffects.playSoftClick();
    localStorage.setItem("temp_selected_artisan", artisanName);
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
            <LuxuryIcon name="crown" size={13} color="#c5a059" />
            <span>THE MASTER CRAFTSMEN</span>
          </div>

          <h1 className="serif" style={{ margin: "0 0 1rem", fontSize: "clamp(2.4rem, 6vw, 4rem)" }}>
            The Master <span className="gold-text italic">Artisans</span>
          </h1>
          <p style={{ color: "#888", maxWidth: "620px", margin: "0 auto", fontSize: "0.92rem", lineHeight: 1.6 }}>
            The visionary hands behind every signature silhouette. Experienced master barbers who transform classic men's grooming into high art.
          </p>
        </div>

        {/* Artisans Grid */}
        <div className="responsive-card-grid">
          {ARTISANS.map((barber) => {
            const isOccupied = occupiedBarbers.includes(barber.name);

            return (
              <div
                key={barber.id}
                className="artisan-card-luxury"
                style={{
                  padding: 0,
                  background: "#0c0c0c",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Image Section */}
                <div style={{ position: "relative", height: "400px", overflow: "hidden", background: "#111" }}>
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "grayscale(100%)",
                      transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    className="artisan-img"
                  />

                  {/* Status Overlay Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      background: "rgba(5, 5, 5, 0.85)",
                      backdropFilter: "blur(8px)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      border: isOccupied ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: isOccupied ? "#ef4444" : "#22c55e",
                        display: "inline-block",
                        boxShadow: isOccupied ? "0 0 8px #ef4444" : "0 0 8px #22c55e",
                      }}
                    />
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: isOccupied ? "#ef4444" : "#22c55e", letterSpacing: "1px" }}>
                      {isOccupied ? "IN-CHAIR NOW" : "AVAILABLE"}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      background: "rgba(5, 5, 5, 0.85)",
                      backdropFilter: "blur(8px)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "#c5a059",
                      border: "1px solid rgba(197, 160, 89, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <LuxuryIcon name="star" size={13} color="#c5a059" />
                    {barber.rating}
                  </div>
                </div>

                {/* Details Section */}
                <div style={{ padding: "22px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ color: "#c5a059", fontSize: "0.7rem", letterSpacing: "2px", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                      {barber.role} • {barber.experience}
                    </span>

                    <h3 className="serif" style={{ fontSize: "1.6rem", margin: "0 0 8px", color: "#fff" }}>
                      {barber.name}
                    </h3>

                    <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "14px" }}>
                      {barber.specialty}
                    </p>

                    <div style={{ fontSize: "0.72rem", color: "#666", marginBottom: "18px" }}>
                      <span style={{ color: "#aaa" }}>Working Days:</span> {barber.workingDays.join(", ")}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookWithArtisan(barber.name)}
                    className="btn-gold"
                    style={{ width: "100%", padding: "12px", gap: "8px", justifyContent: "center" }}
                  >
                    <LuxuryIcon name="sparkle" size={14} color="#000" />
                    RESERVE WITH {barber.name.toUpperCase()}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .artisan-card-luxury:hover {
          border-color: rgba(197, 160, 89, 0.45) !important;
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(197, 160, 89, 0.12);
        }
        .artisan-card-luxury:hover .artisan-img {
          filter: grayscale(0%) !important;
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
};

export default Barbers;
