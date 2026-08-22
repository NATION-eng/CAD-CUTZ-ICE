import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { LuxuryIcon } from "../components/LuxuryIcon";
import type { Booking } from "../types";

const Queue: React.FC = () => {
  const [queue, setQueue] = useState<Booking[]>([]);
  const [inChairSessions, setInChairSessions] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for active waiting queue
    const qActive = query(
      collection(db, "bookings"),
      where("status", "==", "active")
    );

    const unsubActive = onSnapshot(qActive, (snapshot) => {
      const activeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      // Sort by time
      setQueue(activeData.sort((a, b) => (a.time || "").localeCompare(b.time || "")));
      setLoading(false);
    });

    // 2. Listen for in-chair sessions
    const qInChair = query(
      collection(db, "bookings"),
      where("status", "==", "in-chair")
    );

    const unsubInChair = onSnapshot(qInChair, (snapshot) => {
      const inChairData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      setInChairSessions(inChairData);
    });

    return () => {
      unsubActive();
      unsubInChair();
    };
  }, []);

  return (
    <div style={{ padding: "140px 6% 90px", background: "#050505", minHeight: "100vh", color: "#fff" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span className="eyebrow">LIVE FROM THE ATELIER FLOOR</span>
          <h1 className="serif" style={{ fontSize: "clamp(2.5rem, 6vw, 4.2rem)", margin: "0 0 1rem" }}>
            The Live <span className="gold-text italic">Waiting List</span>
          </h1>
          <p style={{ color: "#888", maxWidth: "600px", margin: "0 auto", fontSize: "0.95rem" }}>
            Real-time synchronization with our studio floor. See who is currently in-chair and upcoming reservations.
          </p>
        </div>

        {/* IN-CHAIR ACTIVE SPOTLIGHTS */}
        {inChairSessions.length > 0 && (
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.2rem" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulseGold 2s infinite" }} />
              <h3 className="serif" style={{ fontSize: "1.3rem", color: "#22c55e", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                Currently In-Chair ({inChairSessions.length})
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {inChairSessions.map((client) => (
                <div
                  key={client.id}
                  style={{
                    background: "rgba(34, 197, 94, 0.05)",
                    border: "1.5px solid rgba(34, 197, 94, 0.4)",
                    borderRadius: "10px",
                    padding: "20px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className="badge-emerald" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <LuxuryIcon name="sparkle" size={10} color="#22c55e" />
                      IN PROGRESS
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#888" }}>Artisan: <strong style={{ color: "#fff" }}>{client.artisan}</strong></span>
                  </div>
                  <h4 style={{ fontSize: "1.2rem", color: "#fff", margin: "0 0 4px" }}>
                    {client.customerName}
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#22c55e", margin: 0 }}>
                    {client.service}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WAITING QUEUE LIST */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 className="serif" style={{ fontSize: "1.4rem", color: "#c5a059", margin: 0 }}>
              Up Next in Queue ({queue.length})
            </h3>
            <Link to="/booking" className="btn-gold" style={{ padding: "8px 18px", fontSize: "0.72rem", gap: "6px" }}>
              <LuxuryIcon name="scissors" size={12} color="#000" />
              JOIN THE QUEUE
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
              Synchronizing with studio floor...
            </div>
          ) : queue.length === 0 ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                background: "#0c0c0c",
                border: "1px dashed rgba(197, 160, 89, 0.25)",
                borderRadius: "12px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <LuxuryIcon name="chair" size={36} color="#c5a059" />
              </div>
              <h3 className="serif" style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "8px" }}>
                The Chair is Open!
              </h3>
              <p style={{ color: "#888", maxWidth: "450px", margin: "0 auto 1.5rem" }}>
                There are no waiting clients in queue right now. You will be served immediately!
              </p>
              <Link to="/booking" className="btn-gold">
                BOOK YOUR SEAT NOW
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {queue.map((person, index) => (
                <div
                  key={person.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 24px",
                    background: index === 0 ? "rgba(197, 160, 89, 0.08)" : "#0c0c0c",
                    border: index === 0
                      ? "1.5px solid #c5a059"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.6rem",
                        fontWeight: 900,
                        color: index === 0 ? "#c5a059" : "#555",
                        width: "40px",
                      }}
                    >
                      #{index + 1}
                    </span>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h4 style={{ fontSize: "1.15rem", color: "#fff", margin: 0, fontWeight: 700 }}>
                          {person.customerName}
                        </h4>
                        {index === 0 && (
                          <span className="badge-gold" style={{ fontSize: "0.6rem", padding: "2px 6px" }}>
                            UP NEXT
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "#888", margin: "3px 0 0" }}>
                        {person.service} • Artisan: <span style={{ color: "#c5a059" }}>{person.artisan}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.7rem", color: "#666", display: "block" }}>SCHEDULED TIME</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ddd" }}>{person.time}</span>
                    </div>

                    <div
                      style={{
                        background: index === 0 ? "rgba(197, 160, 89, 0.2)" : "#161616",
                        color: index === 0 ? "#c5a059" : "#777",
                        border: `1px solid ${index === 0 ? "#c5a059" : "#333"}`,
                        padding: "6px 14px",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                      }}
                    >
                      {index === 0 ? "CALLING SOON" : "WAITING"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Queue;
