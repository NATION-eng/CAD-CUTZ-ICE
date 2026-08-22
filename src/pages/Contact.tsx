import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "../context/ToastContext";
import { soundEffects } from "../utils/soundEffects";
import { LuxuryIcon } from "../components/LuxuryIcon";

const Contact: React.FC = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Concierge Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error("Please enter your name and message.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "message"), {
        ...formData,
        status: "unread",
        createdAt: serverTimestamp(),
      });

      soundEffects.playSuccessChime();
      toast.success("Thank you! Our concierge team will reply shortly.", "Message Received");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "General Concierge Inquiry",
        message: "",
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to transmit message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "#050505",
    border: "1px solid rgba(197, 160, 89, 0.25)",
    color: "#fff",
    padding: "12px 14px",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    width: "100%",
    borderRadius: "6px",
    outline: "none",
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="contact-grid">
          {/* Left Column: Location & Contact Cards */}
          <div>
            <span className="eyebrow">CONCIERGE & ATELIER LOCATION</span>
            <h1 className="serif" style={{ margin: "0 0 1.2rem" }}>
              Reach <span className="gold-text italic">Our Atelier</span>
            </h1>
            <p style={{ color: "#888", marginBottom: "2rem", lineHeight: 1.6 }}>
              Whether you wish to arrange a private after-hours VIP session, bridal groom package, or inquire about dreadlock styling, our concierge is at your service.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Location Card */}
              <div
                style={{
                  background: "#0c0c0c",
                  border: "1px solid rgba(197, 160, 89, 0.2)",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <LuxuryIcon name="location" size={18} color="#c5a059" />
                  <span style={{ color: "#c5a059", fontSize: "0.72rem", letterSpacing: "2px", fontWeight: 700 }}>
                    ATELIER ADDRESS
                  </span>
                </div>
                <p style={{ color: "#ddd", fontSize: "0.88rem", lineHeight: 1.5, margin: "0 0 12px" }}>
                  CAD CUTZ Egbelu-ogbogoro road Opp. SDA Church Egbelu-Mgbaraja, Ogbogoro Town, Obio/Akpor LGA, Port Harcourt, Rivers State.
                </p>
                <a
                  href="https://maps.google.com/?q=CAD+CUTZ+Ogbogoro+Port+Harcourt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ padding: "8px 16px", fontSize: "0.72rem", letterSpacing: "1px", width: "fit-content", gap: "6px" }}
                >
                  <LuxuryIcon name="location" size={14} color="#c5a059" />
                  GET DIRECTIONS
                </a>
              </div>

              {/* Concierge Communication */}
              <div
                style={{
                  background: "#0c0c0c",
                  border: "1px solid rgba(197, 160, 89, 0.2)",
                  borderRadius: "10px",
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1.2rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <LuxuryIcon name="email" size={14} color="#c5a059" />
                    <span style={{ color: "#c5a059", fontSize: "0.72rem", letterSpacing: "1.5px", fontWeight: 700 }}>
                      DIRECT EMAIL
                    </span>
                  </div>
                  <p style={{ color: "#ddd", fontSize: "0.85rem", margin: 0 }}>concierge@cadcutz.com</p>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <LuxuryIcon name="phone" size={14} color="#c5a059" />
                    <span style={{ color: "#c5a059", fontSize: "0.72rem", letterSpacing: "1.5px", fontWeight: 700 }}>
                      PHONE / WHATSAPP
                    </span>
                  </div>
                  <p style={{ color: "#ddd", fontSize: "0.85rem", margin: 0 }}>08116079309</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transmission Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#0c0c0c",
              padding: "clamp(20px, 4vw, 36px)",
              borderRadius: "14px",
              border: "1px solid rgba(197, 160, 89, 0.3)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
            }}
          >
            <h3 className="serif" style={{ fontSize: "clamp(1.3rem, 3vw, 1.6rem)", marginBottom: "0.4rem" }}>
              Send an <span className="gold-text">Inquiry</span>
            </h3>
            <p style={{ color: "#777", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
              Leave a note and our front-desk manager will respond within the hour.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "4px" }}>
                  YOUR NAME *
                </label>
                <input
                  type="text"
                  placeholder="Alexander Vance"
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "4px" }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    style={inputStyle}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "4px" }}>
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    placeholder="08116079309"
                    style={inputStyle}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "4px" }}>
                  INQUIRY SUBJECT
                </label>
                <select
                  style={inputStyle}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="General Concierge Inquiry">General Concierge Inquiry</option>
                  <option value="Private VIP Booking / Groom Suite">Private VIP Booking / Groom Suite</option>
                  <option value="Dreadlock Artistry Consultation">Dreadlock Artistry Consultation</option>
                  <option value="Event / Group Grooming Package">Event / Group Grooming Package</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "4px" }}>
                  YOUR MESSAGE *
                </label>
                <textarea
                  placeholder="How may our concierge assist your grooming experience today?"
                  style={{ ...inputStyle, height: "120px", resize: "none" }}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-gold"
                style={{ width: "100%", padding: "12px", marginTop: "6px", gap: "8px" }}
                disabled={loading}
              >
                <LuxuryIcon name="sparkle" size={16} color="#000" />
                {loading ? "TRANSMITTING..." : "SEND CONCIERGE MESSAGE"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
