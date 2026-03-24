import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Gallery from "../components/Gallery"; // Import the magic gallery

export default function Home() {
  return (
    <main style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      {/* Hero: The impactful entrance */}
      <Hero />

      {/* Stats: Proof of excellence */}
      <Stats />

      {/* Gallery: The final "Experience the Magic" section */}
      <Gallery />

      {/* Subtle bottom padding to ensure clean scroll finish */}
      <div style={{ height: "60px" }}></div>
    </main>
  );
}
