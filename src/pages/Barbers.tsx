import React from "react";

const Barbers: React.FC = () => {
  const team = [
    {
      name: "Seyi",
      role: "Master Artisan",
      specialty: "Skin Fades & Sharp Lines",
      image:
        "https://plus.unsplash.com/premium_photo-1664048713133-a69782f08faa?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "John",
      role: "Creative Lead",
      specialty: "Classic Scissor Cuts",
      image:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop",
    },
    {
      name: "David",
      role: "Stylist",
      specialty: "Beard Sculpture",
      image:
        "https://plus.unsplash.com/premium_photo-1661270415179-f7bcff006edb?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <div
      style={{
        padding: "120px 5% 80px", // Reduced top padding for mobile accessibility
        background: "var(--bg-black)",
        minHeight: "100vh",
      }}
    >
      <div
        className="container"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <header style={{ marginBottom: "4rem" }}>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 3.5rem)", // Responsive font size
              marginBottom: "1rem",
            }}
          >
            The <span className="gold-text italic">Artisans</span>
          </h2>
          <p
            style={{
              color: "var(--gray)",
              maxWidth: "600px",
              lineHeight: "1.6",
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
            }}
          >
            The hands behind the Cuts. Where every cut is a symphony of
            precision.
          </p>
        </header>

        <div className="barber-grid">
          {team.map((barber, i) => (
            <div key={i} className="barber-card-container">
              <div className="image-frame">
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="barber-img"
                />
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  borderBottom: "1px solid rgba(197, 160, 89, 0.2)",
                  paddingBottom: "1.5rem",
                }}
              >
                <span
                  className="gold-text"
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "3px",
                    fontWeight: "bold",
                    display: "block",
                  }}
                >
                  {barber.role.toUpperCase()}
                </span>
                <h3
                  className="serif"
                  style={{ fontSize: "1.8rem", margin: "0.5rem 0" }}
                >
                  {barber.name}
                </h3>
                <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
                  {barber.specialty}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .barber-grid {
          display: grid;
          /* Automatically adjusts columns based on screen width */
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 3rem;
        }

        .image-frame {
          aspect-ratio: 3 / 4; /* Keeps consistent shape regardless of screen width */
          width: 100%;
          overflow: hidden;
          background: #111;
          border: 1px solid rgba(197, 160, 89, 0.1);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
        }

        /* Adjust height for larger screens where grid columns are wider */
        @media (min-width: 1024px) {
          .image-frame {
            height: 450px;
            aspect-ratio: auto;
          }
        }

        .barber-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(100%);
          transition: all 0.8s ease;
        }

        .barber-card-container:hover .image-frame {
          border: 1.5px solid #c5a059;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
          transform: translateY(-10px);
        }

        .barber-card-container:hover .barber-img {
          filter: grayscale(0%);
          transform: scale(1.05);
        }

        .barber-card-container {
          cursor: pointer;
        }

        /* Mobile specific adjustments */
        @media (max-width: 768px) {
          .barber-grid {
            gap: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Barbers;
