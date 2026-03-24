import React, { useState } from "react";
import { db } from "../firebase"; // Ensure this path is correct
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const Contact: React.FC = () => {
  // 1. State for the form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    background: "var(--bg-black)",
    border: "var(--border)",
    color: "var(--text-white)",
    padding: "0.75rem",
    fontSize: "1rem",
    fontFamily: "inherit",
    width: "100%",
    marginBottom: "1rem",
  };

  // 2. Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message || !formData.name) {
      alert("Please enter your name and message.");
      return;
    }

    setLoading(true);
    try {
      // Must use "message" (singular) to match your Admin Dashboard listener
      await addDoc(collection(db, "message"), {
        ...formData,
        status: "unread",
        createdAt: serverTimestamp(), // This implements the field you added
      });

      alert("Message sent successfully!");
      setFormData({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      }); // Reset
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "150px 5% 80px", background: "var(--bg-black)" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "5rem",
          }}
        >
          <div>
            <h2
              className="serif"
              style={{ fontSize: "3.5rem", marginBottom: "2rem" }}
            >
              Reach <span className="gold-text">Out</span>
            </h2>
            <p style={{ color: "var(--gray)", marginBottom: "2rem" }}>
              Our home base is in the heart of Port Harcourt. Stop by for the
              experience.
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
              <span
                className="gold-text"
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "2px",
                  fontWeight: "bold",
                }}
              >
                LOCATION
              </span>
              <p>
                CAD CUTZ Egbelu-ogbogoro road Opp. SDA Church Egbelu-Mgbaraja,
                Ogbogoro Town. Obio/Akpor Local Government Area, Rivers State.
                Nigeria
              </p>
            </div>

            <div>
              <span
                className="gold-text"
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "2px",
                  fontWeight: "bold",
                }}
              >
                EMAIL
              </span>
              <p>info@groomingmovement.com</p>
            </div>
          </div>

          {/* 3. The Form Logic */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#0c0c0c",
              padding: "3rem",
              border: "var(--border)",
            }}
          >
            <h3 className="serif" style={{ marginBottom: "1.5rem" }}>
              Send a Message
            </h3>

            <input
              type="text"
              placeholder="Your Name"
              style={inputStyle}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <input
              type="email"
              placeholder="Your Email"
              style={inputStyle}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Your Message"
              style={{
                ...inputStyle,
                height: "150px",
              }}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
            ></textarea>

            <button
              type="submit"
              className="btn-gold"
              style={{
                width: "100%",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "SENDING..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
