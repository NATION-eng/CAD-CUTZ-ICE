import React from "react";
import { Link } from "react-router-dom";
import { LuxuryIcon } from "./LuxuryIcon";
import type { IconName } from "./LuxuryIcon";

const reviews = [
  {
    id: 1,
    name: "Emeka Nwosu",
    title: "Oil & Gas Executive",
    quote: "CAD CUTZ & ICE isn't just a barbershop — it's an executive sanctuary. Seyi's skin fades and the hot towel finish are world-class.",
    rating: 5,
  },
  {
    id: 2,
    name: "Dr. Tari Briggs",
    title: "Surgeon & Entrepreneur",
    quote: "The digital queue and VIP booking system are so smooth. I step straight into the chair without wasting time in waiting rooms.",
    rating: 5,
  },
  {
    id: 3,
    name: "Chukwudi Alabi",
    title: "Creative Director",
    quote: "Best dreadlock retwist and beard sculpting in Port Harcourt. The ambiance and attention to detail are second to none.",
    rating: 5,
  },
];

const perks: { iconName: IconName; title: string; desc: string }[] = [
  {
    iconName: "crown",
    title: "Master Craftsmanship",
    desc: "Every cut is executed with surgical razor precision and personalized consultation.",
  },
  {
    iconName: "lightning",
    title: "Live Queue & Zero Wait",
    desc: "Track real-time chair availability on your phone and arrive right when your seat is ready.",
  },
  {
    iconName: "diamond",
    title: "Premium Cold Lounge",
    desc: "Complimentary beverage service, chilled purified ice amenities, and high-speed device charging.",
  },
  {
    iconName: "sparkle",
    title: "Artisanal Organic Oils",
    desc: "Formulated with pure tea tree, argan, and botanical extracts for optimal hair and scalp vitality.",
  },
];

export const LuxuryHighlights: React.FC = () => {
  return (
    <section style={{ padding: "80px 6%", background: "#080808", borderTop: "1px solid rgba(197, 160, 89, 0.12)", borderBottom: "1px solid rgba(197, 160, 89, 0.12)" }}>
      <div className="container" style={{ maxWidth: "1300px" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="eyebrow">THE CAD CUTZ STANDARD</span>
          <h2 className="serif" style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", margin: "0 0 1rem" }}>
            Why Gentlemen Choose <span className="gold-text italic">CAD CUTZ</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2rem", marginBottom: "5rem" }}>
          {perks.map((p, i) => (
            <div
              key={i}
              className="card-luxury"
              style={{
                background: "#0c0c0c",
                border: "1px solid rgba(197, 160, 89, 0.15)",
                padding: "32px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <LuxuryIcon name={p.iconName} size={32} color="#c5a059" />
              </div>
              <h3 style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "10px", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#888", lineHeight: 1.5, margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="eyebrow">PATRON TESTIMONIALS</span>
          <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: 0 }}>
            Distinguished <span className="gold-text italic">Feedback</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                background: "#0c0c0c",
                border: "1px solid rgba(197, 160, 89, 0.2)",
                borderRadius: "12px",
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ color: "#c5a059", display: "flex", gap: "3px", marginBottom: "14px" }}>
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <LuxuryIcon key={idx} name="star" size={14} color="#c5a059" />
                  ))}
                </div>
                <p style={{ color: "#ccc", fontSize: "0.92rem", fontStyle: "italic", lineHeight: 1.6, marginBottom: "20px" }}>
                  "{r.quote}"
                </p>
              </div>

              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "14px" }}>
                <h4 style={{ color: "#fff", fontSize: "1rem", margin: 0 }}>{r.name}</h4>
                <span style={{ fontSize: "0.72rem", color: "#c5a059" }}>{r.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(197, 160, 89, 0.15) 0%, rgba(14, 14, 14, 0.95) 100%)",
            border: "1px solid rgba(197, 160, 89, 0.35)",
            borderRadius: "16px",
            padding: "48px 32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <span className="eyebrow" style={{ margin: 0 }}>ELEVATE YOUR IMAGE TODAY</span>
          <h3 className="serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", margin: 0 }}>
            Experience the <span className="gold-text italic">Difference</span>
          </h3>
          <p style={{ color: "#aaa", maxWidth: "550px", margin: 0 }}>
            Claim your seat in the chair today. Book online to bypass waiting rooms and secure priority seating.
          </p>
          <Link to="/booking" className="btn-gold" style={{ padding: "1.2rem 3rem", gap: "8px" }}>
            <LuxuryIcon name="sparkle" size={16} color="#000" />
            RESERVE VIP SESSION NOW
          </Link>
        </div>
      </div>
    </section>
  );
};
