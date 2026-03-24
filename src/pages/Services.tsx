import React from "react";

const Services: React.FC = () => {
  const serviceGroups = [
    {
      category: "Manicure & Pedicure Services",
      items: [
        { service: "Signature Pedicure", price: "₦7,000" },
        { service: "Pedicure & Manicure Combo", price: "₦10,000" },
        { service: "Precision Nail Trim (Hands)", price: "₦2,000" },
        { service: "Precision Nail Trim (Hands & Feet)", price: "₦4,000" },
        { service: "Acrylic Application", price: "Contact Us" },
        { service: "Essential Manicure", price: "₦3,000" },
      ],
    },
    {
      category: "Master Barbering",
      items: [
        { service: "Adult Precision Haircut", price: "₦3,000" },
        { service: "Texturing & Softening", price: "₦5,000" },
        { service: "Single Tone Dye Application", price: "₦2,000" },
        { service: "Signature Lining or Shave", price: "₦1,500" },
        { service: "Spotting Wave Foundation", price: "₦10,000" },
      ],
    },
    {
      category: "Artisanal Tinting & Care",
      items: [
        { service: "White Tinting Blunt", price: "₦20,000" },
        { service: "Custom Color Tinting", price: "₦17,000" },
        { service: "Deep Pore Face Masking", price: "₦2,000" },
        { service: "Invigorating Hair Wash", price: "₦2,000" },
        { service: "Therapeutic Scalp Treatment", price: "₦3,000" },
      ],
    },
    {
      category: "Beard Sculpture & Treatment",
      items: [
        { service: "Detail Shaving or Lining", price: "₦1,500" },
        { service: "Premium Beard Grooming", price: "₦5,000" },
        { service: "Beard Tinting & Definition", price: "₦6,000" },
        { service: "Natural White Beard Maintenance", price: "₦5,000" },
      ],
    },
    {
      category: "Young Gentlemen (Children)",
      items: [
        { service: "Children’s Precision Cut", price: "₦2,000" },
        { service: "Barbing & Dye Enhancement", price: "₦4,000" },
        { service: "Refined Lining", price: "₦1,000" },
      ],
    },
    {
      category: "Dreadlock Artistry",
      items: [
        { service: "Full Foundation Locking", price: "₦40,000" },
        { service: "High Fade Re-Locking", price: "₦15,000" },
        { service: "Afro Hair Re-Locking", price: "₦25,000" },
        { service: "Dread Tinting", price: "₦15,000" },
        { service: "Dread Therapeutic Treatment", price: "₦10,000" },
        {
          service: "Total Dread Care (Shampoo/Condition/Dry)",
          price: "₦30,000",
        },
        { service: "Ear or Nose Piercing", price: "₦3,000" },
      ],
    },
    {
      category: "Premium Amenities & Retail",
      items: [
        { service: "Secure Device Charging Station", price: "Complimentary" },
        { service: "Boutique Hair Accessories", price: "View Selection" },
        { service: "Purified Ice Blocks", price: "On Request" },
      ],
    },
  ];

  return (
    <div
      style={{
        padding: "150px 5% 80px",
        background: "var(--bg-black)",
        color: "white",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 className="serif" style={{ fontSize: "3.5rem", margin: "0" }}>
            The <span className="gold-text italic">Service Menu</span>
          </h2>
          <p
            style={{
              color: "var(--gold)",
              letterSpacing: "2px",
              margin: "10px auto 0",
              fontSize: "0.8rem",
            }}
          >
            CAD CUTZ AND ICE • NEW PRICE REVIEW
          </p>
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {serviceGroups.map((group, idx) => (
            <div key={idx} style={{ marginBottom: "4rem" }}>
              <h3
                className="serif italic"
                style={{
                  color: "var(--gold)",
                  fontSize: "1.5rem",
                  borderLeft: "3px solid var(--gold)",
                  paddingLeft: "1rem",
                  marginBottom: "1.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {group.category}
              </h3>

              {group.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "1rem 0",
                    borderBottom: "1px solid rgba(197, 160, 89, 0.05)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: "300",
                      flex: "1",
                    }}
                  >
                    {item.service}
                  </div>
                  <div
                    style={{
                      flex: "1",
                      borderBottom: "1px dotted rgba(255,255,255,0.1)",
                      margin: "0 15px",
                      height: "1px",
                    }}
                  ></div>
                  <div
                    className="serif gold-text"
                    style={{ fontSize: "1.2rem", fontWeight: "bold" }}
                  >
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* POLICY FOOTER */}
          <div
            style={{
              marginTop: "4rem",
              padding: "2rem",
              border: "1px solid rgba(197, 160, 89, 0.3)",
              textAlign: "center",
              background: "rgba(197, 160, 89, 0.02)",
            }}
          >
            <p
              style={{
                color: "var(--gray)",
                fontSize: "0.85rem",
                fontStyle: "italic",
                marginBottom: "1rem",
                margin: "0 auto 1rem auto",
              }}
            >
              "To maintain our standard of excellence, please settle all
              accounts at the central payment terminal. Direct transactions with
              staff are strictly prohibited."
            </p>
            <p
              className="gold-text serif"
              style={{ fontSize: "1.1rem", letterSpacing: "3px", margin: "0 auto" }}
            >
              — MANAGEMENT —
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
