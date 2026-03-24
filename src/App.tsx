import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Queue from "./pages/Queue";
import Barbers from "./pages/Barbers";
import Contact from "./pages/Contact";
import Styles from "./pages/Styles";
import AdminDashboard from "./pages/AdminDashboard";

// Helper component to fix scroll-position on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  return (
    <div className="app-container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <ScrollToTop />

      {/* Hide Navbar on Admin page for a cleaner "Internal Tool" look */}
      {!isAdminPage && <Navbar />}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/barbers" element={<Barbers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/styles" element={<Styles />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Hide Footer on Admin page to maximize screen space for the Queue */}
      {!isAdminPage && <Footer />}
    </div>
  );
}
