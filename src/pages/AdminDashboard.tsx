import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  getDocs,
  Timestamp,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import "./AdminDashboard.css";
import { useNotifications } from "../hooks/useNotifications";
import { useToast } from "../context/ToastContext";
import { useModal } from "../context/ModalContext";
import { soundEffects } from "../utils/soundEffects";
import { SERVICES_CATALOG, ARTISANS } from "../data/salonData";
import { LuxuryIcon } from "../components/LuxuryIcon";
import { exportDailyPdfReport } from "../utils/pdfExport";
import type { Booking, MessageItem } from "../types";

// Helper to calculate exact date/time
const parseTimeWithDate = (timeStr: string, dateStr: string) => {
  if (!timeStr) return new Date();

  let time = timeStr;
  let modifier = "";

  if (timeStr.includes(" ")) {
    [time, modifier] = timeStr.split(" ");
  }

  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

// In-Chair Session Timer Component
const SessionTimer: React.FC<{
  startTime: any;
  duration: number;
  onTimeUp: () => void;
}> = ({ startTime, duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const hasTriggered = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!startTime) return;
      const start = startTime.toDate ? startTime.toDate() : new Date(startTime);
      const end = start.getTime() + (duration || 30) * 60000;
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("TIME REACHED");
        if (!hasTriggered.current) {
          onTimeUp();
          hasTriggered.current = true;
        }
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, duration, onTimeUp]);

  return <span className="timer-text">{timeLeft}</span>;
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { permission, requestPermission, sendNotification } = useNotifications();
  const toast = useToast();
  const modal = useModal();

  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("barber_admin") === "true"
  );
  const [password, setPassword] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "messages">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projectedRevenue, setProjectedRevenue] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [commissionRate, setCommissionRate] = useState<number>(40); // 40% to barber, 60% to salon
  const [stats, setStats] = useState({
    revenue: 0,
    barberEarnings: {} as Record<string, number>,
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  // Quick Walk-in Modal State
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinService, setWalkinService] = useState(SERVICES_CATALOG[0].name);
  const [walkinArtisan, setWalkinArtisan] = useState(ARTISANS[0].name);
  const [walkinLoading, setWalkinLoading] = useState(false);

  const ADMIN_SECRET = "CAD123";
  const prevBookingsCount = useRef<number | null>(null);
  const prevMessagesCount = useRef<number | null>(null);
  const alertedBookings = useRef(new Set());

  // Request notification permission if not yet granted
  useEffect(() => {
    if (isAdmin && permission === "default") {
      requestPermission();
    }
  }, [isAdmin, permission, requestPermission]);

  // Session start scheduler
  useEffect(() => {
    if (!isAdmin) return;
    const precisionClock = setInterval(() => {
      const now = new Date();
      bookings.forEach((b) => {
        if (b.status === "active") {
          const scheduled = parseTimeWithDate(b.time, selectedDate);

          if (now >= scheduled && !alertedBookings.current.has(b.id)) {
            soundEffects.playAdminNewBooking();
            alertedBookings.current.add(b.id);

            // Trigger customer notification flag in Firestore
            updateDoc(doc(db, "bookings", b.id), { isReady: true });

            sendNotification(`ATELIER: Session Start`, {
              body: `Time for ${b.customerName}'s ${b.time} appointment with ${b.artisan}.`,
              tag: `admin-alert-${b.id}`,
            });

            toast.info(`Appointment time reached for ${b.customerName}!`, "Session Scheduled");
          }
        }
      });
    }, 1000);
    return () => clearInterval(precisionClock);
  }, [isAdmin, bookings, selectedDate, sendNotification, toast]);

  // Main Live Data Listeners
  useEffect(() => {
    if (!isAdmin) return;

    // 1. Live Bookings
    const unsubLive = onSnapshot(
      query(
        collection(db, "bookings"),
        where("status", "in", ["active", "in-chair"]),
        where("date", "==", selectedDate)
      ),
      (snap) => {
        const currentDocs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Booking[];

        const liveTotal = currentDocs.reduce(
          (acc, curr) => acc + (Number(curr.price) || 0),
          0
        );
        setProjectedRevenue(liveTotal);

        if (
          prevBookingsCount.current !== null &&
          currentDocs.length > prevBookingsCount.current
        ) {
          soundEffects.playAdminNewBooking();
          toast.success("A new appointment reservation was booked!", "New Booking");
        }
        prevBookingsCount.current = currentDocs.length;
        setBookings(
          currentDocs.sort((a, b) => (a.time || "").localeCompare(b.time || ""))
        );
      }
    );

    // 2. Completed History for Stats
    const unsubStats = onSnapshot(
      query(
        collection(db, "bookings"),
        where("status", "==", "completed"),
        where("date", "==", selectedDate)
      ),
      (snap) => {
        let dRev = 0;
        const earningsMap: Record<string, number> = {};
        const historyDocs: any[] = [];

        snap.docs.forEach((d) => {
          const data = d.data();
          const price = Number(data.price || 0);
          dRev += price;
          const artisanName = data.artisan || "Unknown";
          earningsMap[artisanName] = (earningsMap[artisanName] || 0) + price;

          const compDate = data.completedAt?.toDate() || new Date();
          historyDocs.push({
            id: d.id,
            ...data,
            displayTime: compDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            rawComp: compDate.getTime(),
          });
        });

        setStats({ revenue: dRev, barberEarnings: earningsMap });
        setHistory(historyDocs.sort((a, b) => b.rawComp - a.rawComp));
      }
    );

    // 3. Customer Messages
    const unsubMsg = onSnapshot(
      query(collection(db, "message"), orderBy("createdAt", "desc")),
      (snap) => {
        const msgDocs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as MessageItem[];

        if (
          prevMessagesCount.current !== null &&
          msgDocs.length > prevMessagesCount.current
        ) {
          soundEffects.playAdminNewBooking();
          toast.info("A new customer message has arrived.", "New Inquiry");
        }
        prevMessagesCount.current = msgDocs.length;
        setMessages(msgDocs);
      }
    );

    return () => {
      unsubLive();
      unsubStats();
      unsubMsg();
    };
  }, [isAdmin, selectedDate, toast]);

  // Quick Walk-in Insertion
  const handleQuickWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) {
      toast.error("Please enter the walk-in customer name.");
      return;
    }

    setWalkinLoading(true);
    const serviceObj = SERVICES_CATALOG.find((s) => s.name === walkinService);
    const price = serviceObj ? serviceObj.price : 3000;
    const duration = serviceObj ? serviceObj.duration : 30;

    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    try {
      await addDoc(collection(db, "bookings"), {
        customerName: `${walkinName.trim()} (Walk-in)`,
        phone: walkinPhone.trim() || "Walk-in Guest",
        service: walkinService,
        services: [walkinService],
        price: price,
        totalPrice: price,
        duration: duration,
        artisan: walkinArtisan,
        date: selectedDate,
        time: currentTimeStr,
        status: "active",
        isReady: false,
        createdAt: serverTimestamp(),
      });

      soundEffects.playSuccessChime();
      toast.success(`${walkinName} was placed into the active queue!`, "Walk-in Added");
      setShowWalkinModal(false);
      setWalkinName("");
      setWalkinPhone("");
    } catch (err: any) {
      toast.error("Walk-in error: " + err.message);
    } finally {
      setWalkinLoading(false);
    }
  };

  // Delay Session (+15 Mins)
  const handleDelaySession = async (booking: Booking) => {
    const [h, m] = (booking.time || "12:00").split(":").map(Number);
    const newMins = (m + 15) % 60;
    const newHours = h + Math.floor((m + 15) / 60);
    const newTime = `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;

    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        time: newTime,
      });
      toast.info(`Updated scheduled time for ${booking.customerName} to ${newTime}`);
    } catch (err: any) {
      toast.error("Error delaying session: " + err.message);
    }
  };

  // Mark No-Show
  const handleMarkNoShow = async (bookingId: string, name: string) => {
    const confirmed = await modal.confirm({
      title: "Mark No-Show?",
      message: `Are you sure you want to mark ${name} as a no-show? This will remove them from the active queue.`,
      confirmText: "MARK NO-SHOW",
      isDestructive: true,
    });

    if (confirmed) {
      try {
        await updateDoc(doc(db, "bookings", bookingId), {
          status: "no-show",
        });
        toast.warning(`Marked ${name} as no-show.`);
      } catch (err: any) {
        toast.error("Error: " + err.message);
      }
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (bookingId: string) => {
    const confirmed = await modal.confirm({
      title: "Delete Booking Record?",
      message: "Are you sure you want to permanently delete this reservation record?",
      confirmText: "DELETE RECORD",
      isDestructive: true,
    });

    if (confirmed) {
      try {
        await deleteDoc(doc(db, "bookings", bookingId));
        toast.info("Booking record deleted.");
      } catch (err: any) {
        toast.error("Delete failed: " + err.message);
      }
    }
  };

  // Export Daily Financial Statement as PDF
  const handleExportPDF = () => {
    const salonNet = Math.round(stats.revenue * ((100 - commissionRate) / 100));
    const artisanPool = Math.round(stats.revenue * (commissionRate / 100));

    exportDailyPdfReport({
      date: selectedDate,
      totalGross: stats.revenue,
      salonNet,
      artisanPool,
      commissionRate,
      barberEarnings: stats.barberEarnings,
      bookings,
      history,
    });

    soundEffects.playSoftClick();
    toast.success(`Generated official PDF statement for ${selectedDate}`);
  };

  // Cleanup completed records older than 30 days
  const handleCleanup = async () => {
    const confirmed = await modal.confirm({
      title: "Prune Historical Data?",
      message: "Permanently delete completed records older than 30 days from the database?",
      confirmText: "PRUNE OLD RECORDS",
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const q = query(
        collection(db, "bookings"),
        where("status", "==", "completed"),
        where("completedAt", "<=", Timestamp.fromDate(thirtyDaysAgo))
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));

      await batch.commit();
      toast.success(`Cleanup successful! Pruned ${snapshot.size} archived records.`);
    } catch (error: any) {
      toast.error("Cleanup failed: " + error.message);
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAdmin) {
    return (
      <div className="login-container">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="eyebrow">CAD CUTZ ATELIER</span>
          <h2 className="login-title serif" style={{ fontSize: "2.2rem", color: "#fff" }}>
            Staff Operations Portal
          </h2>
          <p style={{ color: "#888", fontSize: "0.85rem", maxWidth: "340px", margin: "0 auto" }}>
            Enter your staff security passcode to orchestrate the salon queue and view revenue.
          </p>

          <div
            style={{
              marginTop: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(197, 160, 89, 0.12)",
              border: "1px solid rgba(197, 160, 89, 0.3)",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              color: "#c5a059",
            }}
          >
            <span>Passcode: <strong>CAD123</strong></span>
            <button
              type="button"
              onClick={() => setPassword("CAD123")}
              style={{
                background: "var(--gold-gradient)",
                color: "#000",
                border: "none",
                borderRadius: "10px",
                padding: "2px 8px",
                fontSize: "0.65rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Autofill
            </button>
          </div>
        </div>

        <form
          className="login-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (password === ADMIN_SECRET) {
              await requestPermission();
              setIsAdmin(true);
              localStorage.setItem("barber_admin", "true");
              soundEffects.playSuccessChime();
              toast.success("Welcome to Staff Operations Console", "Authenticated");
            } else {
              toast.error("Invalid passcode. Use CAD123 to enter.", "Access Denied");
            }
          }}
        >
          <input
            type="password"
            placeholder="Enter Passcode (CAD123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            autoFocus
          />
          <button type="submit" className="login-btn">
            ENTER ATELIER CONSOLE
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* HEADER */}
      <div className="admin-header">
        <div className="header-tabs">
          <div
            onClick={() => setActiveTab("bookings")}
            className={`tab-item ${activeTab === "bookings" ? "active" : ""}`}
          >
            <h1 className="tab-title">LIVE QUEUE & SESSIONS</h1>
          </div>
          <div
            onClick={() => setActiveTab("messages")}
            className={`tab-item ${activeTab === "messages" ? "active" : ""}`}
            style={{ position: "relative" }}
          >
            <h1 className="tab-title">CONCIERGE MESSAGES</h1>
            {messages.filter((m) => m.status === "unread").length > 0 && (
              <span className="badge">
                {messages.filter((m) => m.status === "unread").length}
              </span>
            )}
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowWalkinModal(true)}
            className="btn-insights"
            style={{ background: "var(--gold-gradient)", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <LuxuryIcon name="lightning" size={14} color="#000" />
            QUICK WALK-IN ENTRY
          </button>
          <button onClick={() => setShowStats(true)} className="btn-insights" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <LuxuryIcon name="diamond" size={14} color="#c5a059" />
            FINANCIAL INSIGHTS
          </button>
          <button onClick={handleExportPDF} className="btn-action" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <LuxuryIcon name="download" size={14} color="#c5a059" />
            EXPORT PDF STATEMENT
          </button>
          <button onClick={() => navigate("/")} className="btn-action">
            PUBLIC SITE
          </button>
          <button
            onClick={() => {
              setIsAdmin(false);
              localStorage.removeItem("barber_admin");
              toast.info("Logged out of staff session.");
            }}
            className="btn-logout"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {activeTab === "bookings" ? (
        <div className="admin-dashboard-grid">
          {/* LEFT: LIVE QUEUE & IN-CHAIR CARDS */}
          <div>
            <div className="queue-value-card">
              <span className="label-small">LIVE ATELIER REVENUE PROJECTION</span>
              <h2 className="big-value">
                ₦{(projectedRevenue + stats.revenue).toLocaleString()}
              </h2>
              <div className="value-detail">
                {selectedDate} Closed Total: ₦{stats.revenue.toLocaleString()} | Active Queue Projected: ₦{projectedRevenue.toLocaleString()}
              </div>
            </div>

            <div className="bookings-grid">
              {bookings.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", padding: "60px", textAlign: "center", border: "1px dashed #333", borderRadius: "10px", color: "#888" }}>
                  <div style={{ marginBottom: "10px" }}>
                    <LuxuryIcon name="chair" size={32} color="#c5a059" />
                  </div>
                  <h3 className="serif" style={{ color: "#fff", fontSize: "1.3rem" }}>All Chairs Clear</h3>
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>No active or in-chair reservations for this date.</p>
                </div>
              ) : (
                bookings.map((b) => {
                  const isInChair = b.status === "in-chair";

                  return (
                    <div
                      key={b.id}
                      className="booking-card"
                      style={{
                        border: isInChair
                          ? "1.5px solid #22c55e"
                          : "1px solid rgba(197, 160, 89, 0.2)",
                        background: isInChair ? "rgba(34, 197, 94, 0.04)" : "#0c0c0c",
                      }}
                    >
                      <div className="booking-card-header">
                        <span
                          className="time-badge"
                          style={{
                            background: isInChair ? "rgba(34, 197, 94, 0.2)" : "#1a1a1a",
                            color: isInChair ? "#22c55e" : "#c5a059",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <LuxuryIcon name="clock" size={12} color={isInChair ? "#22c55e" : "#c5a059"} />
                          {b.time}
                        </span>
                        <span className="price-tag" style={{ color: "#22c55e" }}>
                          ₦{Number(b.price || 0).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="customer-name">{b.customerName}</h3>
                      <p className="service-info">
                        <strong>{b.service}</strong> • Artisan: <span style={{ color: "#c5a059" }}>{b.artisan}</span>
                      </p>

                      {b.phone && (
                        <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <LuxuryIcon name="phone" size={12} color="#888" />
                          {b.phone}
                        </div>
                      )}

                      {/* IN-CHAIR SESSION TIMER */}
                      {isInChair && (
                        <div className="session-timer-container">
                          <span style={{ fontSize: "0.7rem", color: "#888", display: "block", marginBottom: "2px" }}>
                            ESTIMATED REMAINING
                          </span>
                          <SessionTimer
                            startTime={b.sessionStartedAt}
                            duration={b.duration}
                            onTimeUp={() => {
                              soundEffects.playSessionReadyAlert();
                              toast.info(`Session for ${b.customerName} has completed allocated time.`);
                            }}
                          />
                        </div>
                      )}

                      {/* ACTION BUTTONS */}
                      <div className="card-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
                        <button
                          onClick={() => {
                            const newStatus = b.status === "active" ? "in-chair" : "completed";
                            const updateData: any = { status: newStatus };
                            if (newStatus === "in-chair") {
                              updateData.sessionStartedAt = serverTimestamp();
                              soundEffects.playSuccessChime();
                              toast.success(`${b.customerName} is now in chair with ${b.artisan}`);
                            } else {
                              updateData.completedAt = serverTimestamp();
                              soundEffects.playSuccessChime();
                              toast.success(`Session completed for ${b.customerName}!`);
                            }
                            updateDoc(doc(db, "bookings", b.id), updateData);
                          }}
                          className="btn-session"
                          style={{
                            background: isInChair
                              ? "linear-gradient(135deg, #15803d 0%, #22c55e 100%)"
                              : "var(--gold-gradient)",
                            color: isInChair ? "#fff" : "#000",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <LuxuryIcon name={b.status === "active" ? "lightning" : "check"} size={14} color={isInChair ? "#fff" : "#000"} />
                          {b.status === "active" ? "START SESSION" : "COMPLETE SESSION"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelaySession(b)}
                          style={{
                            background: "transparent",
                            border: "1px solid #444",
                            color: "#aaa",
                            padding: "8px 10px",
                            borderRadius: "4px",
                            fontSize: "0.68rem",
                            cursor: "pointer",
                          }}
                          title="Delay +15 Minutes"
                        >
                          +15m
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkNoShow(b.id, b.customerName)}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#ef4444",
                            padding: "8px 10px",
                            borderRadius: "4px",
                            fontSize: "0.68rem",
                            cursor: "pointer",
                          }}
                          title="Mark No-Show"
                        >
                          No-Show
                        </button>

                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="btn-delete"
                          title="Delete Record"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: COMPLETED HISTORY ACCORDION */}
          <div className="history-container">
            <div className="history-header">
              <h3 className="section-title">COMPLETED SESSIONS</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>

            <div className="total-row">
              <span className="total-label">SETTLED REVENUE:</span>
              <span className="total-value">₦{stats.revenue.toLocaleString()}</span>
            </div>

            <div className="history-list">
              {history.length === 0 ? (
                <p style={{ color: "#555", fontSize: "0.8rem", textAlign: "center", padding: "20px" }}>
                  No completed sessions on this date yet.
                </p>
              ) : (
                history.map((h: any) => (
                  <div key={h.id} className="history-item">
                    <div className="history-top">
                      <span style={{ fontWeight: 600 }}>{h.customerName}</span>
                      <span className="history-profit">
                        +₦{Number(h.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="history-bottom">
                      {h.artisan} • {h.service} • {h.displayTime}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MESSAGES INBOX VIEW */
        <div className="messages-container">
          {messages.length === 0 ? (
            <p className="empty-state">No concierge inquiries received yet...</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`message-card ${m.status === "unread" ? "unread" : ""}`}
              >
                <div className="msg-header">
                  <div>
                    <h4 className="msg-name">{m.name || "Unknown Guest"}</h4>
                    <p className="msg-email">
                      {m.email} {m.phone && `• ${m.phone}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {m.status === "unread" && (
                      <button
                        onClick={() => {
                          updateDoc(doc(db, "message", m.id), { status: "read" });
                          toast.info("Message marked as read.");
                        }}
                        style={{
                          background: "transparent",
                          border: "1px solid #c5a059",
                          color: "#c5a059",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontSize: "0.68rem",
                          cursor: "pointer",
                        }}
                      >
                        MARK READ
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        const confirmed = await modal.confirm({
                          title: "Delete Message?",
                          message: "Permanently delete this inquiry from the inbox?",
                          confirmText: "DELETE",
                          isDestructive: true,
                        });
                        if (confirmed) {
                          deleteDoc(doc(db, "message", m.id));
                          toast.info("Message deleted.");
                        }
                      }}
                      className="msg-delete-btn"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
                <p className="msg-subject">{m.subject}</p>
                <p className="msg-body">{m.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* QUICK WALK-IN MODAL */}
      {showWalkinModal && (
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
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#0c0c0c",
              border: "1px solid rgba(197, 160, 89, 0.35)",
              borderRadius: "14px",
              padding: "clamp(20px, 4vw, 32px)",
              maxWidth: "460px",
              width: "94%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 className="serif" style={{ fontSize: "1.4rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <LuxuryIcon name="lightning" size={18} color="#c5a059" />
                Fast <span className="gold-text">Walk-in Entry</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowWalkinModal(false)}
                style={{ background: "none", border: "none", color: "#666", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickWalkin}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", fontWeight: 700, marginBottom: "4px" }}>
                    CLIENT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Guest Name"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#050505",
                      border: "1px solid rgba(197, 160, 89, 0.3)",
                      padding: "12px",
                      color: "#fff",
                      borderRadius: "6px",
                      fontFamily: "inherit",
                    }}
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", fontWeight: 700, marginBottom: "4px" }}>
                    PHONE NUMBER (OPTIONAL)
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#050505",
                      border: "1px solid rgba(197, 160, 89, 0.3)",
                      padding: "12px",
                      color: "#fff",
                      borderRadius: "6px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", fontWeight: 700, marginBottom: "4px" }}>
                    SERVICE
                  </label>
                  <select
                    value={walkinService}
                    onChange={(e) => setWalkinService(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#050505",
                      border: "1px solid rgba(197, 160, 89, 0.3)",
                      padding: "12px",
                      color: "#fff",
                      borderRadius: "6px",
                      fontFamily: "inherit",
                    }}
                  >
                    {SERVICES_CATALOG.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} — ₦{s.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#c5a059", fontWeight: 700, marginBottom: "4px" }}>
                    ASSIGN ARTISAN
                  </label>
                  <select
                    value={walkinArtisan}
                    onChange={(e) => setWalkinArtisan(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#050505",
                      border: "1px solid rgba(197, 160, 89, 0.3)",
                      padding: "12px",
                      color: "#fff",
                      borderRadius: "6px",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="First Available Artisan">First Available Artisan</option>
                    {ARTISANS.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowWalkinModal(false)}
                    className="btn-outline"
                    style={{ flex: 1, padding: "12px", fontSize: "0.75rem" }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={walkinLoading}
                    className="btn-gold"
                    style={{ flex: 1, padding: "12px", fontSize: "0.75rem" }}
                  >
                    {walkinLoading ? "QUEUING..." : "ADD TO QUEUE NOW"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATS & COMMISSION SPLIT DRAWER */}
      <div className={`stats-drawer ${showStats ? "open" : ""}`}>
        <div className="drawer-header">
          <button
            onClick={() => setShowStats(false)}
            className="drawer-close-btn"
          >
            CLOSE ✕
          </button>
          <h2 className="drawer-title">FINANCIAL INSIGHTS ({selectedDate})</h2>
        </div>

        <MiniStat label="DAILY SETTLED GROSS" value={stats.revenue} color="#22c55e" />
        <MiniStat
          label={`SALON NET (${100 - commissionRate}%)`}
          value={Math.round(stats.revenue * ((100 - commissionRate) / 100))}
          color="#c5a059"
        />
        <MiniStat
          label={`ARTISANS POOL (${commissionRate}%)`}
          value={Math.round(stats.revenue * (commissionRate / 100))}
          color="#38bdf8"
        />

        <div style={{ margin: "20px 0" }}>
          <label style={{ fontSize: "0.68rem", color: "#888", display: "block", marginBottom: "6px" }}>
            ADJUST ARTISAN COMMISSION SPLIT: {commissionRate}%
          </label>
          <input
            type="range"
            min="20"
            max="70"
            step="5"
            value={commissionRate}
            onChange={(e) => setCommissionRate(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#c5a059" }}
          />
        </div>

        <hr className="divider" />

        <h3 className="barber-split-title">ARTISAN EARNINGS BREAKDOWN</h3>
        {Object.entries(stats.barberEarnings).map(([name, val]: [string, any]) => {
          const artisanCut = Math.round(val * (commissionRate / 100));
          return (
            <div key={name} className="barber-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "2px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span className="barber-name" style={{ fontWeight: 600 }}>{name}</span>
                <span className="barber-val">₦{val.toLocaleString()} gross</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#38bdf8" }}>
                Artisan Payout ({commissionRate}%): ₦{artisanCut.toLocaleString()}
              </div>
            </div>
          );
        })}

        <hr className="divider" />

        <button
          onClick={handleExportPDF}
          className="btn-action"
          style={{ width: "100%", marginBottom: "10px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <LuxuryIcon name="download" size={16} color="#c5a059" />
          EXPORT OFFICIAL PDF STATEMENT
        </button>

        <button onClick={handleCleanup} className="btn-cleanup">
          PRUNE OLD ARCHIVED RECORDS (&gt;30 DAYS)
        </button>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, color }: any) => (
  <div className="mini-stat">
    <div className="mini-stat-label">{label}</div>
    <div className="mini-stat-value" style={{ color: color }}>
      ₦{Number(value || 0).toLocaleString()}
    </div>
  </div>
);

export default AdminDashboard;
