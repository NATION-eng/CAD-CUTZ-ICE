import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Gallery from "../components/Gallery";
import { LuxuryHighlights } from "../components/Testimonials";

export default function Home() {
  return (
    <main style={{ backgroundColor: "#050505", minHeight: "100vh" }}>
      {/* Hero: The impactful entrance */}
      <Hero />

      {/* Stats: Proof of excellence */}
      <Stats />

      {/* Luxury Standards & Patron Reviews */}
      <LuxuryHighlights />

      {/* Gallery: The "Experience the Magic" section */}
      <Gallery />
    </main>
  );
}
