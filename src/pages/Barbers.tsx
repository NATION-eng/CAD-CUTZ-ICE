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
    <div style={{ padding: "140px 6% 90px", background: "var(--bg-black)", minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: "1300px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="eyebrow">THE CRAFTSMEN</span>
          <h1 className="serif" style={{ fontSize: "clamp(2.5rem, 6vw, 4.2rem)", margin: "0 0 1rem" }}>
            The Master <span className="gold-text italic">Artisans</span>
          </h1>
          <p style={{ color: "var(--gray)", maxWidth: "620px", margin: "0 auto", fontSize: "0.95rem" }}>
            The visionary hands behind every contour. Master barbers who transform grooming into high art.
          </p>
        </div>

        {/* Artisans Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3rem",
          }}
        >
          {ARTISANS.map((barber) => {
            const isOccupied = occupiedBarbers.includes(barber.name);

            return (
              <div
                key={barber.id}
                className="card-luxury"
                style={{
                  padding: 0,
                  background: "#0c0c0c",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Image Section */}
                <div style={{ position: "relative", height: "420px", overflow: "hidden" }}>
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
                      top: "16px",
                      left: "16px",
                      background: "rgba(5, 5, 5, 0.85)",
                      backdropFilter: "blur(8px)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: isOccupied ? "#ef4444" : "#22c55e",
                        display: "inline-block",
                      }}
                    />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: isOccupied ? "#ef4444" : "#22c55e", letterSpacing: "1px" }}>
                      {isOccupied ? "IN-CHAIR NOW" : "READY / AVAILABLE"}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: "rgba(5, 5, 5, 0.85)",
                      backdropFilter: "blur(8px)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#c5a059",
                      border: "1px solid rgba(197, 160, 89, 0.3)",
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
                <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ color: "#c5a059", fontSize: "0.72rem", letterSpacing: "2.5px", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                      {barber.role} • {barber.experience}
                    </span>

                    <h3 className="serif" style={{ fontSize: "1.8rem", margin: "0 0 8px", color: "#fff" }}>
                      {barber.name}
                    </h3>

                    <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "16px" }}>
                      {barber.specialty}
                    </p>

                    <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "20px" }}>
                      <span style={{ color: "#aaa" }}>Active Schedule:</span> {barber.workingDays.join(", ")}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookWithArtisan(barber.name)}
                    className="btn-gold"
                    style={{ width: "100%", padding: "14px", gap: "8px" }}
                  >
                    <LuxuryIcon name="sparkle" size={14} color="#000" />
                    BOOK SESSION WITH {barber.name.toUpperCase()}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .card-luxury:hover .artisan-img {
          filter: grayscale(0%) !important;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default Barbers;
