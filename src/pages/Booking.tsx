import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { useToast } from "../context/ToastContext";
import { useModal } from "../context/ModalContext";
import { soundEffects } from "../utils/soundEffects";
import { SERVICES_CATALOG, ARTISANS, SALON_HOURS } from "../data/salonData";
import { LuxuryIcon } from "../components/LuxuryIcon";
import type { ServiceItem, Booking as BookingType } from "../types";
import "./Booking.css";

const CATEGORIES = [
  "All",
  "Barbering",
  "Beard & Shave",
  "Treatments & Color",
  "Dreadlocks",
  "Nails & Pedicure",
  "Young Gentlemen",
] as const;

// Requested WhatsApp Concierge Line
const CONCIERGE_WHATSAPP = "2348116079309";

const Booking: React.FC = () => {
  const { requestPermission, sendNotification } = useNotifications();
  const toast = useToast();
  const modal = useModal();

  // Booking Flow Steps: 1: Services -> 2: Artisan -> 3: Date/Time -> 4: Details
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [selectedArtisan, setSelectedArtisan] = useState<string>("First Available Artisan");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lookup Modal State
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  // Busy/Booked Slots for selected date
  const [bookedSlotsForDate, setBookedSlotsForDate] = useState<string[]>([]);
  const [occupiedBarbers, setOccupiedBarbers] = useState<string[]>([]);

  // Active Ticket
  const [activeBookingId, setActiveBookingId] = useState<string | null>(
    localStorage.getItem("active_booking_id")
  );
  const [bookingDetails, setBookingDetails] = useState<BookingType | null>(null);

  const alerted = useRef(false);

  // Check pre-selected style from Lookbook
  useEffect(() => {
    const savedStyle = localStorage.getItem("temp_selected_style");
    if (savedStyle) {
      const match = SERVICES_CATALOG.find((s) =>
        s.name.toLowerCase().includes(savedStyle.toLowerCase()) ||
        savedStyle.toLowerCase().includes(s.name.toLowerCase())
      ) || SERVICES_CATALOG[0];

      if (match) {
        setSelectedServices([match]);
        toast.info(`Pre-selected "${savedStyle}" for your booking!`, "Lookbook Selection");
      }
      localStorage.removeItem("temp_selected_style");
    } else if (selectedServices.length === 0) {
      setSelectedServices([SERVICES_CATALOG[0]]);
    }
  }, [toast]);

  // Real-time occupied artisans listener
  useEffect(() => {
    const q = query(collection(db, "bookings"), where("status", "==", "in-chair"));
    const unsub = onSnapshot(q, (snapshot) => {
      const busy = snapshot.docs.map((d) => d.data().artisan);
      setOccupiedBarbers(busy);
    });
    return () => unsub();
  }, []);

  // Listen to booked slots for the selected date to prevent conflicts
  useEffect(() => {
    if (!selectedDate) return;
    const q = query(
      collection(db, "bookings"),
      where("date", "==", selectedDate),
      where("status", "in", ["active", "in-chair"])
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const slots = snapshot.docs
        .filter((d) => {
          if (selectedArtisan === "First Available Artisan") return false;
          return d.data().artisan === selectedArtisan;
        })
        .map((d) => d.data().time);
      setBookedSlotsForDate(slots);
    });
    return () => unsub();
  }, [selectedDate, selectedArtisan]);

  // Active Booking live listener
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
            const data = { id: docSnap.id, ...docSnap.data() } as BookingType;
            setBookingDetails(data);

            if (data.isReady && !alerted.current) {
              soundEffects.playSessionReadyAlert();
              sendNotification("Your Session is Ready!", {
                body: `Hi ${data.customerName}, ${data.artisan} is ready for you in the chair. Please step inside!`,
                tag: `cust-ready-${activeBookingId}`,
              });
              toast.success(`Your artisan ${data.artisan} is ready for you!`, "In-Chair Ready");
              alerted.current = true;
            }
          } else {
            setActiveBookingId(null);
            localStorage.removeItem("active_booking_id");
            setBookingDetails(null);
            alerted.current = false;
          }
        },
        (error) => {
          console.error("Firestore snapshot error:", error);
        }
      );
      return () => unsub();
    }
  }, [activeBookingId, sendNotification, toast]);

  // Calculations for total price & duration
  const totalSummary = useMemo(() => {
    const price = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const duration = selectedServices.reduce((sum, s) => sum + s.duration, 0) || 30;
    return { price, duration };
  }, [selectedServices]);

  // Generate valid time slots based on day-of-week operating hours
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateObj = new Date(`${selectedDate}T12:00:00`);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const hours = SALON_HOURS[dayName];

    if (!hours || !hours.isOpen) return [];

    const [openH, openM] = hours.open.split(":").map(Number);
    const [closeH, closeM] = hours.close.split(":").map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const slots: { time: string; display: string; isPast: boolean; isBooked: boolean }[] = [];
    const now = new Date();
    const isToday = selectedDate === now.toISOString().split("T")[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let m = openMinutes; m <= closeMinutes - 30; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

      const period = h >= 12 ? "PM" : "AM";
      const formattedH = h % 12 === 0 ? 12 : h % 12;
      const displayStr = `${formattedH}:${min.toString().padStart(2, "0")} ${period}`;

      const isPast = isToday && m <= currentMinutes + 15;
      const isBooked = bookedSlotsForDate.includes(timeStr) || bookedSlotsForDate.includes(displayStr);

      slots.push({
        time: timeStr,
        display: displayStr,
        isPast,
        isBooked,
      });
    }

    return slots;
  }, [selectedDate, bookedSlotsForDate]);

  const toggleServiceSelection = (service: ServiceItem) => {
    soundEffects.playSoftClick();
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        if (prev.length === 1) {
          toast.warning("You must select at least one primary service.");
          return prev;
        }
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      toast.error("Please select at least one service.");
      setCurrentStep(1);
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      toast.error("Please select an available date and time slot.");
      setCurrentStep(3);
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      toast.error("Please provide your name and contact phone number.");
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    await requestPermission();

    const primaryService = selectedServices.map((s) => s.name).join(" + ");
    const serviceNames = selectedServices.map((s) => s.name);

    try {
      const newBookingRef = doc(collection(db, "bookings"));

      await runTransaction(db, async (transaction) => {
        if (selectedArtisan !== "First Available Artisan") {
          const conflictQuery = query(
            collection(db, "bookings"),
            where("artisan", "==", selectedArtisan),
            where("date", "==", selectedDate),
            where("time", "==", selectedTimeSlot),
            where("status", "in", ["active", "in-chair"])
          );

          const conflictSnap = await getDocs(conflictQuery);
          if (!conflictSnap.empty) {
            throw new Error(
              `The slot at ${selectedTimeSlot} with ${selectedArtisan} was just claimed. Please pick another slot.`
            );
          }
        }

        transaction.set(newBookingRef, {
          customerName: fullName.trim(),
          phone: phone.trim(),
          service: primaryService,
          services: serviceNames,
          price: totalSummary.price,
          totalPrice: totalSummary.price,
          duration: totalSummary.duration,
          artisan: selectedArtisan,
          date: selectedDate,
          time: selectedTimeSlot,
          notes: notes.trim(),
          status: "active",
          isReady: false,
          createdAt: serverTimestamp(),
        });
      });

      localStorage.setItem("active_booking_id", newBookingRef.id);
      setActiveBookingId(newBookingRef.id);
      soundEffects.playSuccessChime();
      toast.success("Your appointment reservation has been secured!", "VIP Pass Created");
    } catch (err: any) {
      console.error("Booking Error:", err);
      toast.error(err.message || "Failed to create reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!activeBookingId) return;

    const confirmed = await modal.confirm({
      title: "Cancel Reservation?",
      message: "Are you sure you want to release your scheduled seat? This action cannot be undone.",
      confirmText: "YES, CANCEL PASS",
      cancelText: "KEEP APPOINTMENT",
      isDestructive: true,
    });

    if (confirmed) {
      try {
        await updateDoc(doc(db, "bookings", activeBookingId), {
          status: "cancelled",
        });
        localStorage.removeItem("active_booking_id");
        setActiveBookingId(null);
        setBookingDetails(null);
        alerted.current = false;
        soundEffects.playSoftClick();
        toast.info("Your reservation has been cancelled.");
      } catch (err: any) {
        toast.error("Error cancelling reservation: " + err.message);
      }
    }
  };

  const handleLookupBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;

    setLookupLoading(true);
    try {
      const q = query(
        collection(db, "bookings"),
        where("phone", "==", lookupPhone.trim()),
        where("status", "in", ["active", "in-chair"])
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        toast.warning("No active reservation found for this phone number.", "Not Found");
      } else {
        const foundId = snap.docs[0].id;
        localStorage.setItem("active_booking_id", foundId);
        setActiveBookingId(foundId);
        setShowLookupModal(false);
        soundEffects.playSuccessChime();
        toast.success("Found your active VIP pass!", "Welcome Back");
      }
    } catch (err: any) {
      toast.error("Lookup error: " + err.message);
    } finally {
      setLookupLoading(false);
    }
  };

  // Google Calendar Link generator
  const getGoogleCalendarUrl = (booking: BookingType) => {
    const start = new Date(`${booking.date}T${booking.time}:00`);
    const end = new Date(start.getTime() + (booking.duration || 30) * 60000);

    const formatGTime = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d+/g, "");

    const title = encodeURIComponent(`CAD CUTZ & ICE - ${booking.service}`);
    const details = encodeURIComponent(
      `Appointment with ${booking.artisan} at CAD CUTZ & ICE Atelier.\nService: ${booking.service}\nLocation: CAD CUTZ, Egbelu-Ogbogoro Rd, Port Harcourt.`
    );
    const loc = encodeURIComponent("CAD CUTZ Egbelu-ogbogoro road, Port Harcourt");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGTime(start)}/${formatGTime(end)}&details=${details}&location=${loc}`;
  };

  // WhatsApp Share Concierge
  const getWhatsAppShareUrl = (booking: BookingType) => {
    const text = encodeURIComponent(
      `Hello CAD CUTZ Concierge! I have a confirmed reservation for ${booking.customerName} on ${booking.date} at ${booking.time} with ${booking.artisan}. (Pass Ref: #${booking.id.substring(0, 6).toUpperCase()})`
    );
    return `https://wa.me/${CONCIERGE_WHATSAPP}?text=${text}`;
  };

  // --- VIEW 1: VIP DIGITAL PASS (ACTIVE TICKET) ---
  if (activeBookingId && bookingDetails) {
    const isInChair = bookingDetails.status === "in-chair";

    return (
      <div className="booking-page-root">
        <div className="vip-pass-wrapper">
          <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
            <span className="eyebrow">
              {isInChair ? "ATELIER SESSION IN PROGRESS" : "OFFICIAL VIP BOARDING PASS"}
            </span>
            <h2 className="serif" style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", marginTop: "0.2rem" }}>
              {isInChair ? "You Are " : "Seat "}
              <span className="gold-text italic">{isInChair ? "In The Chair" : "Reserved"}</span>
            </h2>
          </div>

          {/* LUXURY VIP PASS CARD */}
          <div
            className="vip-pass-card"
            style={{
              border: isInChair
                ? "1px solid #22c55e"
                : "1px solid rgba(197, 160, 89, 0.35)",
              boxShadow: isInChair
                ? "0 20px 50px rgba(34, 197, 94, 0.15), 0 0 30px rgba(0,0,0,0.9)"
                : "0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(197, 160, 89, 0.15)",
            }}
          >
            {/* Top Pass Status Header */}
            <div
              style={{
                background: isInChair
                  ? "linear-gradient(90deg, #15803d 0%, #22c55e 100%)"
                  : "linear-gradient(90deg, #8c6e30 0%, #c5a059 100%)",
                color: isInChair ? "#ffffff" : "#050505",
                padding: "12px 16px",
                textAlign: "center",
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              <LuxuryIcon name={isInChair ? "sparkle" : "crown"} size={15} color={isInChair ? "#fff" : "#050505"} />
              <span>{isInChair ? "ARTISAN ACTIVE SESSION" : "CONFIRMED RESERVATION"}</span>
              <span style={{ fontSize: "0.65rem", opacity: 0.85 }}>
                • REF #{bookingDetails.id.substring(0, 6).toUpperCase()}
              </span>
            </div>

            {/* Countdown Clock Module */}
            <div style={{ padding: "clamp(16px, 3.5vw, 24px) 14px 14px", textAlign: "center" }}>
              <Countdown
                targetDate={`${bookingDetails.date}T${bookingDetails.time}:00`}
                barberName={bookingDetails.artisan}
              />
            </div>

            {/* Perforated Divider */}
            <div
              style={{
                position: "relative",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-13px",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: "#050505",
                  border: isInChair
                    ? "1px solid #22c55e"
                    : "1px solid rgba(197, 160, 89, 0.35)",
                }}
              />
              <div
                style={{
                  width: "84%",
                  borderTop: isInChair
                    ? "2px dashed rgba(34, 197, 94, 0.4)"
                    : "2px dashed rgba(197, 160, 89, 0.35)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: "-13px",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: "#050505",
                  border: isInChair
                    ? "1px solid #22c55e"
                    : "1px solid rgba(197, 160, 89, 0.35)",
                }}
              />
            </div>

            {/* Ticket Details Grid */}
            <div style={{ padding: "14px clamp(14px, 3.5vw, 28px) 24px" }}>
              <div className="vip-details-grid">
                <div>
                  <span style={{ fontSize: "0.68rem", color: "#777", letterSpacing: "1.5px", textTransform: "uppercase" }}>CLIENT</span>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginTop: "2px" }}>{bookingDetails.customerName}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.68rem", color: "#777", letterSpacing: "1.5px", textTransform: "uppercase" }}>MASTER ARTISAN</span>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#c5a059", marginTop: "2px" }}>{bookingDetails.artisan}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.68rem", color: "#777", letterSpacing: "1.5px", textTransform: "uppercase" }}>APPOINTMENT DATE</span>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ddd", marginTop: "2px" }}>{bookingDetails.date} at {bookingDetails.time}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.68rem", color: "#777", letterSpacing: "1.5px", textTransform: "uppercase" }}>TOTAL VALUE</span>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#22c55e", marginTop: "2px" }}>
                    {bookingDetails.price > 0 ? `₦${bookingDetails.price.toLocaleString()}` : "Complimentary"}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.68rem", color: "#777", letterSpacing: "1.5px", textTransform: "uppercase" }}>SERVICE SELECTION</span>
                <div style={{ fontSize: "0.9rem", color: "#eee", marginTop: "4px", lineHeight: 1.5 }}>{bookingDetails.service}</div>
              </div>

              {/* Action Buttons: Add to Calendar & Concierge */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a
                  href={getGoogleCalendarUrl(bookingDetails)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ width: "100%", padding: "12px", fontSize: "0.75rem", letterSpacing: "1.2px", gap: "8px" }}
                  onClick={() => soundEffects.playSoftClick()}
                >
                  <LuxuryIcon name="calendar" size={16} color="#c5a059" />
                  ADD TO GOOGLE CALENDAR
                </a>

                <a
                  href={getWhatsAppShareUrl(bookingDetails)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "rgba(34, 197, 94, 0.12)",
                    color: "#22c55e",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    padding: "12px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "1.2px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => soundEffects.playSoftClick()}
                >
                  <LuxuryIcon name="whatsapp" size={16} color="#22c55e" />
                  WHATSAPP CONCIERGE (08116079309)
                </a>

                {!isInChair && (
                  <button
                    type="button"
                    onClick={handleCancelBooking}
                    style={{
                      marginTop: "8px",
                      background: "transparent",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      padding: "12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      letterSpacing: "1.5px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    CANCEL THIS RESERVATION
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: MULTI-STEP BOOKING WIZARD ---
  return (
    <div className="booking-page-root">
      <div className="container">
        {/* Header with Title & Lookup Trigger */}
        <div className="booking-header">
          <div className="booking-header-title">
            <span className="eyebrow">RESERVE YOUR APPOINTMENT</span>
            <h1 className="serif">
              The <span className="gold-text italic">Atelier Session</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowLookupModal(true)}
            className="btn-outline booking-retrieve-btn"
          >
            <LuxuryIcon name="search" size={14} color="#c5a059" />
            RETRIEVE MY ACTIVE PASS
          </button>
        </div>

        {/* Wizard Progress Steps Indicator */}
        <div className="booking-steps-container">
          {[
            { num: 1, label: "Services" },
            { num: 2, label: "Artisan" },
            { num: 3, label: "Date & Time" },
            { num: 4, label: "Details" },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < currentStep) setCurrentStep(s.num);
              }}
              className={`booking-step-tab ${currentStep === s.num ? "active" : currentStep > s.num ? "completed" : ""}`}
            >
              <div className="booking-step-number">STEP 0{s.num}</div>
              <div className="booking-step-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Form Container Grid */}
        <form onSubmit={handleConfirmReservation}>
          <div className="booking-layout-grid">
            {/* LEFT COLUMN: ACTIVE STEP CONTENT */}
            <div className="booking-content-column">
              {/* STEP 1: SERVICE CATALOG */}
              {currentStep === 1 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <h3 className="serif" style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", margin: 0 }}>
                      Choose <span className="gold-text">Services & Add-ons</span>
                    </h3>
                    <span style={{ fontSize: "0.72rem", color: "#888" }}>
                      Select one or multiple services
                    </span>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="booking-category-bar">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          soundEffects.playSoftClick();
                          setSelectedCategory(cat);
                        }}
                        className={`booking-category-pill ${selectedCategory === cat ? "active" : ""}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Services Grid */}
                  <div className="booking-services-grid">
                    {SERVICES_CATALOG.filter(
                      (s) => selectedCategory === "All" || s.category === selectedCategory
                    ).map((service) => {
                      const isSelected = selectedServices.some((s) => s.id === service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleServiceSelection(service)}
                          className={`booking-service-card ${isSelected ? "selected" : ""}`}
                        >
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                              <h4 style={{ fontSize: "0.92rem", color: "#fff", fontWeight: 700, margin: 0, textTransform: "none", letterSpacing: "0px", fontFamily: "'Montserrat', sans-serif" }}>
                                {service.name}
                              </h4>
                              {service.popular && (
                                <span className="badge-gold" style={{ fontSize: "0.55rem", padding: "2px 6px" }}>
                                  POPULAR
                                </span>
                              )}
                            </div>
                            {service.description && (
                              <p style={{ fontSize: "0.75rem", color: "#777", marginTop: "6px", lineHeight: 1.4 }}>
                                {service.description}
                              </p>
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                              paddingTop: "8px",
                              marginTop: "4px",
                            }}
                          >
                            <span style={{ fontSize: "0.7rem", color: "#999", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <LuxuryIcon name="clock" size={12} color="#888" />
                              {service.duration} mins
                            </span>
                            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#c5a059" }}>
                              {service.note || `₦${service.price.toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="booking-nav-actions" style={{ justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedServices.length === 0) {
                          toast.error("Please pick at least one service.");
                          return;
                        }
                        soundEffects.playSoftClick();
                        setCurrentStep(2);
                      }}
                      className="btn-gold"
                    >
                      PROCEED TO ARTISAN SELECTION →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ARTISAN SELECTION */}
              {currentStep === 2 && (
                <div>
                  <h3 className="serif" style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", marginBottom: "0.3rem" }}>
                    Select Your <span className="gold-text">Master Artisan</span>
                  </h3>
                  <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "1.2rem" }}>
                    Choose your dedicated craftsman or allow us to match you with the first available chair.
                  </p>

                  <div className="booking-artisans-grid">
                    {/* First Available Option */}
                    <div
                      onClick={() => {
                        soundEffects.playSoftClick();
                        setSelectedArtisan("First Available Artisan");
                      }}
                      className={`booking-artisan-card ${selectedArtisan === "First Available Artisan" ? "selected" : ""}`}
                      style={{ textAlign: "center" }}
                    >
                      <div style={{ marginBottom: "8px" }}>
                        <LuxuryIcon name="lightning" size={24} color="#c5a059" />
                      </div>
                      <h4 style={{ color: "#fff", fontSize: "0.95rem", marginBottom: "4px" }}>First Available Artisan</h4>
                      <p style={{ fontSize: "0.72rem", color: "#888", margin: 0 }}>Fastest seating priority upon your arrival.</p>
                    </div>

                    {/* Named Artisans */}
                    {ARTISANS.map((artisan) => {
                      const isOccupied = occupiedBarbers.includes(artisan.name);
                      const isSelected = selectedArtisan === artisan.name;

                      return (
                        <div
                          key={artisan.id}
                          onClick={() => {
                            soundEffects.playSoftClick();
                            setSelectedArtisan(artisan.name);
                          }}
                          className={`booking-artisan-card ${isSelected ? "selected" : ""}`}
                        >
                          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                            <img
                              src={artisan.avatar}
                              alt={artisan.name}
                              style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "1px solid #c5a059" }}
                            />
                            <div>
                              <h4 style={{ color: "#fff", fontSize: "0.95rem", margin: 0 }}>{artisan.name}</h4>
                              <span style={{ fontSize: "0.68rem", color: "#c5a059", letterSpacing: "1px" }}>{artisan.role}</span>
                            </div>
                          </div>

                          <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "8px" }}>{artisan.specialty}</p>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
                            <span style={{ fontSize: "0.72rem", color: "#c5a059", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <LuxuryIcon name="star" size={12} color="#c5a059" />
                              {artisan.rating}
                            </span>
                            {isOccupied ? (
                              <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: 700 }}>• OCCUPIED</span>
                            ) : (
                              <span style={{ fontSize: "0.65rem", color: "#22c55e", fontWeight: 700 }}>• READY</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="booking-nav-actions">
                    <button type="button" onClick={() => setCurrentStep(1)} className="btn-outline">
                      ← BACK
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playSoftClick();
                        setCurrentStep(3);
                      }}
                      className="btn-gold"
                    >
                      PROCEED TO DATE & TIME →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DATE & TIME SLOT MATRIX */}
              {currentStep === 3 && (
                <div>
                  <h3 className="serif" style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", marginBottom: "0.3rem" }}>
                    Select <span className="gold-text">Date & Time Slot</span>
                  </h3>
                  <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "1.2rem" }}>
                    Choose an exact slot tailored to our salon operating schedule.
                  </p>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "6px" }}>
                      APPOINTMENT DATE
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTimeSlot("");
                      }}
                      style={{
                        width: "100%",
                        background: "#0c0c0c",
                        border: "1px solid rgba(197, 160, 89, 0.3)",
                        padding: "12px",
                        color: "#fff",
                        borderRadius: "6px",
                        fontSize: "16px",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "8px" }}>
                      AVAILABLE TIME SLOTS ({availableTimeSlots.filter((s) => !s.isPast && !s.isBooked).length} OPEN)
                    </label>

                    {availableTimeSlots.length === 0 ? (
                      <div style={{ padding: "20px", background: "#0c0c0c", border: "1px dashed #333", textAlign: "center", color: "#888", fontSize: "0.85rem", borderRadius: "8px" }}>
                        The atelier is closed on this date. Please select another day.
                      </div>
                    ) : (
                      <div className="booking-time-slots-grid">
                        {availableTimeSlots.map((slot) => {
                          const disabled = slot.isPast || slot.isBooked;
                          const isSelected = selectedTimeSlot === slot.time;

                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={disabled}
                              onClick={() => {
                                soundEffects.playSoftClick();
                                setSelectedTimeSlot(slot.time);
                              }}
                              className={`booking-time-slot-btn ${isSelected ? "selected" : ""}`}
                            >
                              {slot.display}
                              {slot.isBooked && <div style={{ fontSize: "0.55rem", color: "#ef4444", marginTop: "2px" }}>BOOKED</div>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="booking-nav-actions">
                    <button type="button" onClick={() => setCurrentStep(2)} className="btn-outline">
                      ← BACK
                    </button>
                    <button
                      type="button"
                      disabled={!selectedTimeSlot}
                      onClick={() => {
                        if (!selectedTimeSlot) {
                          toast.error("Please pick a time slot.");
                          return;
                        }
                        soundEffects.playSoftClick();
                        setCurrentStep(4);
                      }}
                      className="btn-gold"
                    >
                      PROCEED TO CLIENT DETAILS →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CLIENT INFORMATION */}
              {currentStep === 4 && (
                <div>
                  <h3 className="serif" style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", marginBottom: "0.3rem" }}>
                    Your <span className="gold-text">Information</span>
                  </h3>
                  <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "1.2rem" }}>
                    Enter your contact details so our concierge can alert you when your seat is ready.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "4px" }}>
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alexander Vance"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{
                          width: "100%",
                          background: "#0c0c0c",
                          border: "1px solid rgba(197, 160, 89, 0.3)",
                          padding: "12px",
                          color: "#fff",
                          borderRadius: "6px",
                          fontSize: "16px",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "4px" }}>
                        PHONE NUMBER * (For SMS / In-Queue Alert)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 08116079309"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: "100%",
                          background: "#0c0c0c",
                          border: "1px solid rgba(197, 160, 89, 0.3)",
                          padding: "12px",
                          color: "#fff",
                          borderRadius: "6px",
                          fontSize: "16px",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#888", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "4px" }}>
                        SPECIAL INSTRUCTIONS OR BEARD PREFERENCES (OPTIONAL)
                      </label>
                      <textarea
                        placeholder="Any special styling preferences, allergies, or timing notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        style={{
                          width: "100%",
                          background: "#0c0c0c",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          padding: "12px",
                          color: "#fff",
                          borderRadius: "6px",
                          fontSize: "16px",
                          fontFamily: "inherit",
                          resize: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div className="booking-nav-actions">
                    <button type="button" onClick={() => setCurrentStep(3)} className="btn-outline">
                      ← BACK
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-gold"
                      style={{ padding: "12px 20px", gap: "8px" }}
                    >
                      <LuxuryIcon name="sparkle" size={16} color="#000" />
                      {isSubmitting ? "SECURING PASS..." : "CONFIRM VIP RESERVATION"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: LIVE SUMMARY RECEIPT CARD */}
            <div className="booking-summary-card">
              <div style={{ borderBottom: "1px solid rgba(197, 160, 89, 0.2)", paddingBottom: "10px", marginBottom: "12px" }}>
                <span className="eyebrow" style={{ fontSize: "0.65rem", marginBottom: "2px" }}>
                  SESSION SUMMARY
                </span>
                <h4 style={{ color: "#fff", fontSize: "1.05rem", margin: 0 }}>Executive Booking</h4>
              </div>

              {/* Selected Services List */}
              <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedServices.map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span style={{ color: "#ddd" }}>{s.name}</span>
                    <span style={{ color: "#c5a059", fontWeight: 700 }}>
                      {s.price > 0 ? `₦${s.price.toLocaleString()}` : "Free"}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px dashed rgba(255, 255, 255, 0.1)", paddingTop: "10px", marginBottom: "12px", fontSize: "0.78rem", color: "#888" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span>Artisan:</span>
                  <span style={{ color: "#fff" }}>{selectedArtisan}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span>Date:</span>
                  <span style={{ color: "#fff" }}>{selectedDate || "Not chosen"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span>Time:</span>
                  <span style={{ color: "#c5a059", fontWeight: 700 }}>{selectedTimeSlot || "Not chosen"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Est. Duration:</span>
                  <span style={{ color: "#fff" }}>{totalSummary.duration} mins</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(197, 160, 89, 0.3)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.72rem", color: "#888", letterSpacing: "1px", textTransform: "uppercase" }}>TOTAL AMOUNT</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#22c55e" }}>
                  ₦{totalSummary.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* TICKET RETRIEVAL LOOKUP MODAL */}
      {showLookupModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#0c0c0c",
              border: "1px solid rgba(197, 160, 89, 0.35)",
              borderRadius: "14px",
              padding: "clamp(20px, 4vw, 32px)",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 className="serif" style={{ fontSize: "1.2rem", margin: 0 }}>
                Retrieve <span className="gold-text">VIP Pass</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLookupModal(false)}
                style={{ background: "none", border: "none", color: "#666", fontSize: "1.2rem", cursor: "pointer", padding: "4px" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#888", fontSize: "0.82rem", marginBottom: "1.2rem" }}>
              Enter the phone number you used when booking to open your live pass.
            </p>

            <form onSubmit={handleLookupBooking}>
              <input
                type="tel"
                required
                placeholder="e.g. 08116079309"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                style={{
                  width: "100%",
                  background: "#050505",
                  border: "1px solid rgba(197, 160, 89, 0.3)",
                  padding: "12px",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "16px",
                  marginBottom: "1.2rem",
                }}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowLookupModal(false)}
                  className="btn-outline"
                  style={{ flex: 1, padding: "10px", fontSize: "0.72rem" }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="btn-gold"
                  style={{ flex: 1, padding: "10px", fontSize: "0.72rem" }}
                >
                  {lookupLoading ? "SEARCHING..." : "FIND PASS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
