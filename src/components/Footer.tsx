export default function Footer() {
  return (
    <footer
      className="footer"
      style={{
        padding: "4rem 5% 2rem",
        background: "#050505",
        borderTop: "1px solid rgba(197, 160, 89, 0.1)",
        color: "white",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          opacity: 0.8 /* Increased visibility from 0.5 */,
        }}
      >
        {/* Company Copyright */}
        <p style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
          © {new Date().getFullYear()}{" "}
          <span className="gold-text">CAD-CUTZ & ICE</span>. ALL RIGHTS
          RESERVED.
        </p>

        {/* The Secret Door for Staff */}
        <a
          href="/admin"
          style={{
            fontSize: "0.7rem",
            color: "#888" /* Lightened from #444 for better visibility */,
            textDecoration:
              "underline" /* Added underline so it looks like a link */,
            padding: "5px 10px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#c5a059")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#888")}
        >
          Staff Portal
        </a>
      </div>

      <style>{`
        .gold-text { color: #c5a059; }
        .footer p { margin: 0; }
      `}</style>
    </footer>
  );
}
