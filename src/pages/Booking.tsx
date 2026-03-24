import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  runTransaction,
  getDocs,
} from "firebase/firestore";
import Countdown from "../components/Countdown";
import { useNotifications } from "../hooks/useNotifications";

const SERVICES_LIST = [
  // PEDICURE & MANICURE
  { name: "Signature Pedicure", price: 7000, duration: 45 },
  { name: "Pedicure & Manicure Combo", price: 10000, duration: 75 },
  { name: "Precision Nail Trim (Hands)", price: 2000, duration: 15 },
  { name: "Precision Nail Trim (Hands & Feet)", price: 4000, duration: 25 },
  { name: "Acrylic Application", price: 0, note: "Contact Us", duration: 60 },
  { name: "Essential Manicure", price: 3000, duration: 30 },

  // MASTER BARBERING
  { name: "Adult Precision Haircut", price: 3000, duration: 30 },
  { name: "Texturing & Softening", price: 5000, duration: 40 },
  { name: "Single Tone Dye Application", price: 2000, duration: 20 },
  { name: "Signature Lining or Shave", price: 1500, duration: 15 },
  { name: "Spotting Wave Foundation", price: 10000, duration: 45 },

  // ARTISANAL TINTING & CARE
  { name: "White Tinting Blunt", price: 20000, duration: 60 },
  { name: "Custom Color Tinting", price: 17000, duration: 60 },
  { name: "Deep Pore Face Masking", price: 2000, duration: 20 },
  { name: "Invigorating Hair Wash", price: 2000, duration: 15 },
  { name: "Therapeutic Scalp Treatment", price: 3000, duration: 25 },

  // BEARD SCULPTURE
  { name: "Detail Shaving or Lining", price: 1500, duration: 15 },
  { name: "Premium Beard Grooming", price: 5000, duration: 30 },
  { name: "Beard Tinting & Definition", price: 6000, duration: 30 },
  { name: "Natural White Beard Maintenance", price: 5000, duration: 30 },

  // CHILDREN
  { name: "Children’s Precision Cut", price: 2000, duration: 25 },
  { name: "Barbing & Dye Enhancement", price: 4000, duration: 40 },
  { name: "Refined Lining (Kids)", price: 1000, duration: 15 },

  // DREADLOCKS
  { name: "Full Foundation Locking", price: 40000, duration: 180 },
  { name: "High Fade Re-Locking", price: 15000, duration: 60 },
  { name: "Afro Hair Re-Locking", price: 25000, duration: 90 },
  { name: "Dread Tinting", price: 15000, duration: 60 },
  { name: "Dread Therapeutic Treatment", price: 10000, duration: 45 },
  { name: "Total Dread Care (Wash/Dry)", price: 30000, duration: 120 },

  // OTHERS
  { name: "Ear or Nose Piercing", price: 3000, duration: 15 },
  {
    name: "Secure Device Charging",
    price: 0,
    note: "Complimentary",
    duration: 0,
  },
];

const Booking: React.FC = () => {
  const { requestPermission, sendNotification } = useNotifications();
  const [selectedService, setSelectedService] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [artisan, setArtisan] = useState("First Available Artisan");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [occupiedBarbers, setOccupiedBarbers] = useState<string[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(
    localStorage.getItem("active_booking_id"),
  );
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // NEW: Ref to prevent repeating the customer alert
  const alerted = useRef(false);

  useEffect(() => {
    const savedStyle = localStorage.getItem("temp_selected_style");
    if (savedStyle) {
      setSelectedService(savedStyle);
      localStorage.removeItem("temp_selected_style");
    }
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "bookings"),
      where("status", "==", "in-chair"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const busy = snapshot.docs.map((d) => d.data().artisan);
      setOccupiedBarbers(busy);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (activeBookingId) {
      const unsub = onSnapshot(
        doc(db, "bookings", activeBookingId),
        (docSnap) => {
          if (
            docSnap.exists() &&
            (docSnap.data().status === "active" ||
              docSnap.data().status === "in-chair")
          ) {
            const data = docSnap.data();
            setBookingDetails(data);

            // NEW: Trigger Customer Notification when Admin marks as ready
            if (data.isReady && !alerted.current) {
              console.log("Customer Notification Triggered for:", data.customerName);
              sendNotification("👋 Your Session is Ready!", {
                body: `Hi ${data.customerName}, the artisan is ready for you. Please come inside!`,
                tag: `cust-ready-${activeBookingId}`,
              });
              const chime = new Audio(
                "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3",
              );
              chime.play().catch(() => {});
              alerted.current = true;
            }
          } else {
            setActiveBookingId(null);
            localStorage.removeItem("active_booking_id");
            setBookingDetails(null);
            alerted.current = false;
          }
        },
      );
      return () => unsub();
    }
  }, [activeBookingId, sendNotification]);

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    if (selectedDateTime < now) {
      alert("Please select a future date and time.");
      return;
    }

    if (!selectedService || !fullName || !date || !time) {
      alert("Please complete all fields.");
      return;
    }

    await requestPermission();

    const serviceObj = SERVICES_LIST.find((s) => s.name === selectedService);
    const servicePrice = serviceObj ? serviceObj.price : 0;
    const serviceDuration = serviceObj ? serviceObj.duration : 20;

    try {
      const newBookingRef = doc(collection(db, "bookings"));

      await runTransaction(db, async (transaction) => {
        const conflictQuery = query(
          collection(db, "bookings"),
          where("artisan", "==", artisan),
          where("date", "==", date),
          where("time", "==", time),
          where("status", "in", ["active", "in-chair"]),
        );

        const conflictSnap = await getDocs(conflictQuery);

        if (!conflictSnap.empty) {
          throw new Error(
            "This slot was just taken by someone else! Please pick another time.",
          );
        }

        transaction.set(newBookingRef, {
          customerName: fullName,
          phone: phone,
          service: selectedService,
          price: servicePrice,
          duration: serviceDuration,
          artisan: artisan,
          date: date,
          time: time,
          status: "active",
          isReady: false,
          createdAt: serverTimestamp(),
        });
      });

      localStorage.setItem("active_booking_id", newBookingRef.id);
      setActiveBookingId(newBookingRef.id);
    } catch (err: any) {
      console.error("Booking Error:", err);
      alert(err.message || "Something went wrong.");
    }
  };

  const handleCancel = async () => {
    if (
      activeBookingId &&
      window.confirm("Are you sure you want to cancel your session?")
    ) {
      try {
        await updateDoc(doc(db, "bookings", activeBookingId), {
          status: "cancelled",
        });
        localStorage.removeItem("active_booking_id");
        setActiveBookingId(null);
        alerted.current = false;
      } catch (err) {
        console.error("Cancellation Error:", err);
      }
    }
  };

  if (activeBookingId && bookingDetails) {
    const isInChair = bookingDetails.status === "in-chair";
    return (
      <div className="booking-wrapper">
        <div
          className="container ticket-view"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <div
            className="booking-header"
            style={{ textAlign: "center", marginBottom: "3rem" }}
          >
            <span
              className="gold-text booking-eyebrow"
              style={{
                letterSpacing: "5px",
                display: "block",
                marginBottom: "1rem",
              }}
            >
              {isInChair ? "SESSION IN PROGRESS" : "RESERVATION SECURED"}
            </span>
            <h2 className="serif booking-title" style={{ fontSize: "2.5rem" }}>
              {isInChair ? "You are " : "Your Seat is "}
              <span className="gold-text italic">
                {isInChair ? "In the Chair" : "Ready"}
              </span>
            </h2>
          </div>

          <div
            className="ticket-card"
            style={{
              background: "#0c0c0c",
              border: isInChair
                ? "1px solid #22c55e"
                : "1px solid rgba(197,160,89,0.2)",
              position: "relative",
            }}
          >
            <div
              style={{
                background: isInChair ? "#22c55e" : "rgba(197,160,89,0.1)",
                color: isInChair ? "white" : "#c5a059",
                padding: "12px",
                textAlign: "center",
                fontSize: "0.8rem",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              {isInChair
                ? "✨ YOUR ARTISAN HAS STARTED THE SESSION"
                : "WAITING FOR YOUR TURN"}
            </div>

            <div className="ticket-top" style={{ padding: "20px" }}>
              <Countdown
                targetDate={`${bookingDetails.date}T${bookingDetails.time}`}
                barberName={bookingDetails.artisan}
              />
            </div>

            <div
              className="ticket-info"
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div
                className="info-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  paddingBottom: "1rem",
                }}
              >
                <span
                  style={{
                    color: "#666",
                    fontSize: "0.75rem",
                    letterSpacing: "2px",
                  }}
                >
                  SERVICE
                </span>
                <span className="gold-text" style={{ fontWeight: "bold" }}>
                  {bookingDetails.service}{" "}
                  {bookingDetails.price > 0 &&
                    `(₦${bookingDetails.price?.toLocaleString()})`}
                </span>
              </div>
              <div
                className="info-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  paddingBottom: "1rem",
                }}
              >
                <span
                  style={{
                    color: "#666",
                    fontSize: "0.75rem",
                    letterSpacing: "2px",
                  }}
                >
                  ARTISAN
                </span>
                <span style={{ fontWeight: "bold" }}>
                  {bookingDetails.artisan}
                </span>
              </div>
            </div>

            <div
              className="ticket-divider"
              style={{
                position: "relative",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-15px",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#050505",
                  border: isInChair
                    ? "1px solid #22c55e"
                    : "1px solid rgba(197,160,89,0.2)",
                }}
              ></div>
              <div
                style={{
                  width: "80%",
                  borderTop: isInChair
                    ? "2px dotted rgba(34, 197, 94, 0.3)"
                    : "2px dotted rgba(197,160,89,0.3)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  right: "-15px",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#050505",
                  border: isInChair
                    ? "1px solid #22c55e"
                    : "1px solid rgba(197,160,89,0.2)",
                }}
              ></div>
            </div>

            <div
              className="ticket-footer"
              style={{ padding: "2.5rem", textAlign: "center" }}
            >
              <p
                style={{
                  color: "#555",
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  marginBottom: "2rem",
                }}
              >
                {isInChair
                  ? "Please relax and enjoy your session."
                  : "Please arrive 10 minutes early."}
              </p>
              {!isInChair && (
                <button
                  onClick={handleCancel}
                  className="cancel-btn-premium"
                  style={{
                    background: "rgba(255, 77, 77, 0.05)",
                    color: "#ff4d4d",
                    border: "1px solid rgba(255, 77, 77, 0.3)",
                    padding: "1.2rem",
                    width: "100%",
                    cursor: "pointer",
                    fontWeight: "bold",
                    letterSpacing: "3px",
                    fontSize: "0.75rem",
                  }}
                >
                  CANCEL RESERVATION
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-wrapper">
      <div className="container">
        <div className="booking-header">
          <span className="gold-text booking-eyebrow">
            RESERVE THE EXPERIENCE
          </span>
          <h2 className="serif booking-title">
            Book Your <span className="gold-text italic">Session</span>
          </h2>
        </div>

        <div className="booking-grid">
          <div className="booking-left">
            <h3 className="serif booking-subtitle">The Policy</h3>
            <div className="policy-text">
              <p>• Arrive 10 minutes early for your consultation.</p>
              <p>• Cancellation is permitted via this app session only.</p>
            </div>
            <div className="opening-hours">
              <h4 className="serif">Opening Hours</h4>
              <div className="hours-row">
                <span>Mon – Thurs</span>{" "}
                <span className="gold-text">9:00 AM – 10:00 PM</span>
              </div>
              <div className="hours-row">
                <span>Fri</span>{" "}
                <span className="gold-text">10:00 AM – 5:00 PM</span>
              </div>
              <div className="hours-row">
                <span>Sat</span>{" "}
                <span className="gold-text">5:00 PM – 10:00 PM</span>
              </div>
            </div>
          </div>

          <form className="booking-form" onSubmit={handleConfirmReservation}>
            <div className="booking-step">
              <label>
                01. CHOOSE SERVICE{" "}
                {selectedService && (
                  <span className="gold-text">— {selectedService}</span>
                )}
              </label>
              <div
                className="form-grid service-scroll"
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
              >
                {SERVICES_LIST.map((service) => (
                  <div
                    key={service.name}
                    className={`service-card ${selectedService === service.name ? "active" : ""}`}
                    onClick={() => setSelectedService(service.name)}
                  >
                    <div className="serif" style={{ fontSize: "0.85rem" }}>
                      {service.name}
                    </div>
                    <div
                      className="gold-text"
                      style={{ fontSize: "0.8rem", marginTop: "5px" }}
                    >
                      {service.note
                        ? service.note
                        : `₦${service.price.toLocaleString()}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="booking-step">
              <label>02. SELECT ARTISAN</label>
              <select
                className="booking-input"
                value={artisan}
                onChange={(e) => setArtisan(e.target.value)}
              >
                <option value="First Available Artisan">
                  First Available Artisan
                </option>
                <option
                  value="Seyi (Master Artisan)"
                  disabled={occupiedBarbers.includes("Seyi (Master Artisan)")}
                >
                  Seyi{" "}
                  {occupiedBarbers.includes("Seyi (Master Artisan)")
                    ? "— OCCUPIED"
                    : "(Master Artisan)"}
                </option>
                <option
                  value="John (Creative Lead)"
                  disabled={occupiedBarbers.includes("John (Creative Lead)")}
                >
                  John{" "}
                  {occupiedBarbers.includes("John (Creative Lead)")
                    ? "— OCCUPIED"
                    : "(Creative Lead)"}
                </option>
              </select>
            </div>

            <div className="booking-step">
              <label>03. DATE & TIME</label>
              <div className="form-grid">
                <input
                  type="date"
                  className="booking-input"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                />
                <input
                  type="time"
                  className="booking-input"
                  required
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="booking-step">
              <label>04. YOUR DETAILS</label>
              <input
                className="booking-input"
                placeholder="Full Name"
                required
                onChange={(e) => setFullName(e.target.value)}
                style={{ marginBottom: "15px" }}
              />
              <input
                className="booking-input"
                placeholder="Phone Number"
                required
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-gold booking-btn">
              CONFIRM RESERVATION
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .booking-wrapper { padding: 150px 5% 80px; background: #050505; min-height: 100vh; color: white; }
        .booking-header { position: sticky; top: 0; z-index: 10; background: #050505; padding: 1.5rem 0 1.5rem; border-bottom: 1px solid rgba(197, 160, 89, 0.1); }
        .booking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
        .booking-left { border-right: 1px solid rgba(197,160,89,0.15); padding-right: 2rem; }
        .opening-hours { margin-top: 3rem; padding: 2rem; background: #0c0c0c; border: 1px solid rgba(197, 160, 89, 0.1); }
        .hours-row { display: flex; justify-content: space-between; margin-top: 0.8rem; }
        .booking-form { display: flex; flex-direction: column; gap: 2.5rem; }
        .booking-input { width: 100%; background: #0c0c0c; border: 1px solid rgba(197, 160, 89, 0.2); padding: 1.2rem; color: white; outline: none; border-radius: 0; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .service-card { border: 1px solid rgba(255, 255, 255, 0.05); padding: 1.2rem; cursor: pointer; background: #0c0c0c; transition: 0.3s; text-align: center; }
        .service-card:hover { border-color: rgba(197, 160, 89, 0.5); }
        .service-card.active { border-color: #c5a059; background: rgba(197, 160, 89, 0.08); }
        .btn-gold { background: #c5a059; color: black; border: none; padding: 1.5rem; cursor: pointer; font-weight: bold; letter-spacing: 2px; }
        
        .service-scroll::-webkit-scrollbar { width: 4px; }
        .service-scroll::-webkit-scrollbar-thumb { background: #c5a059; }

        @media (max-width: 992px) { .booking-grid { grid-template-columns: 1fr; } .booking-left { border-right: none; border-bottom: 1px solid rgba(197,160,89,0.15); padding-bottom: 3rem; } }
      `}</style>
    </div>
  );
};

export default Booking;
