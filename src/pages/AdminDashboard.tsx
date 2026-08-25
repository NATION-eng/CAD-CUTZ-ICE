import React, { useState, useEffect, useRef, useMemo } from "react";
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
  const [activeTab, setActiveTab] = useState<"queue" | "audit" | "messages">("queue");
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
    () => new Date().toISOString().split("T")[0]
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
      toast.error("Please enter the guest's name.");
      return;
    }

    setWalkinLoading(true);
    try {
      const matchedService = SERVICES_CATALOG.find((s) => s.name === walkinService) || SERVICES_CATALOG[0];

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      await addDoc(collection(db, "bookings"), {
        customerName: walkinName.trim() + " (Walk-in)",
        phone: walkinPhone.trim() || "Walk-in Guest",
        service: matchedService.name,
        services: [matchedService.name],
        price: matchedService.price,
        totalPrice: matchedService.price,
        duration: matchedService.duration,
        artisan: walkinArtisan,
        date: selectedDate,
        time: timeStr,
        status: "active",
        isReady: true,
        createdAt: serverTimestamp(),
      });

      setWalkinName("");
      setWalkinPhone("");
      setShowWalkinModal(false);
      soundEffects.playSuccessChime();
      toast.success("Walk-in client added to live queue!", "Queue Updated");
    } catch (err: any) {
      toast.error("Failed to add walk-in: " + err.message);
    } finally {
      setWalkinLoading(false);
    }
  };

  // Delay Session +15 Minutes
  const handleDelaySession = async (b: Booking) => {
    try {
      const scheduled = parseTimeWithDate(b.time, selectedDate);
      const newTime = new Date(scheduled.getTime() + 15 * 60000);
      const newTimeStr = newTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      await updateDoc(doc(db, "bookings", b.id), {
        time: newTimeStr,
      });
      soundEffects.playSoftClick();
      toast.info(`Session delayed by 15 mins for ${b.customerName} (New time: ${newTimeStr})`);
    } catch (err: any) {
      toast.error("Error delaying session: " + err.message);
    }
  };

  // Mark Client as No-Show
  const handleMarkNoShow = async (id: string, name: string) => {
    const confirmed = await modal.confirm({
      title: "Mark No-Show?",
      message: `Are you sure you want to mark ${name} as a no-show? This will release the chair.`,
      confirmText: "MARK NO-SHOW",
      cancelText: "CANCEL",
      isDestructive: true,
    });

    if (confirmed) {
      try {
        await updateDoc(doc(db, "bookings", id), {
          status: "no-show",
        });
        soundEffects.playSoftClick();
        toast.warning(`${name} marked as no-show.`);
      } catch (err: any) {
        toast.error("Error updating status: " + err.message);
      }
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (id: string) => {
    const confirmed = await modal.confirm({
      title: "Delete Record?",
      message: "Are you sure you want to remove this booking from the active queue?",
      confirmText: "DELETE",
      isDestructive: true,
    });

    if (confirmed) {
      try {
        await deleteDoc(doc(db, "bookings", id));
        soundEffects.playSoftClick();
        toast.info("Booking removed from schedule.");
      } catch (err: any) {
        toast.error("Failed to delete booking: " + err.message);
      }
    }
  };

  // Export PDF Statement
  const handleExportPDF = () => {
    try {
      soundEffects.playSoftClick();
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
      toast.success("Financial statement PDF generated!");
    } catch (err: any) {
      toast.error("Failed to generate PDF: " + err.message);
    }
  };

  // Archive Cleanup
  const handleCleanup = async () => {
    const confirmed = await modal.confirm({
      title: "Prune Old Records?",
      message: "This will permanently purge completed bookings older than 30 days.",
      confirmText: "PURGE ARCHIVES",
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

  // Derived KPI metrics
  const kpis = useMemo(() => {
    const inChairCount = bookings.filter((b) => b.status === "in-chair").length;
    const queueCount = bookings.filter((b) => b.status === "active").length;
    const totalDayValue = stats.revenue + projectedRevenue;
    return { inChairCount, queueCount, totalDayValue };
  }, [bookings, stats.revenue, projectedRevenue]);

  const unreadMessagesCount = useMemo(
    () => messages.filter((m) => m.status === "unread").length,
    [messages]
  );

  // --- LOGIN SCREEN ---
  if (!isAdmin) {
    return (
      <div className="login-container">
        <div className="login-card">
          <span className="eyebrow">CAD CUTZ ATELIER</span>
          <h2 className="login-title serif">Staff Operations</h2>
          <p style={{ color: "#888", fontSize: "0.82rem", margin: "0 auto", lineHeight: 1.5 }}>
            Authorized artisan access only. Enter your master security passcode to enter.
          </p>

          <div
            style={{
              marginTop: "16px",
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
                padding: "3px 8px",
                fontSize: "0.65rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Autofill
            </button>
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
              placeholder="Enter Passcode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              autoFocus
            />
            <button type="submit" className="login-btn">
              AUTHENTICATE CONSOLE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* --- TOP APP BAR --- */}
      <header className="admin-appbar">
        <div className="admin-brand">
          <span className="brand-logo-badge">CAD</span>
          <div className="brand-info">
            <h1 className="brand-title">STAFF ATELIER</h1>
            <span className="brand-status-indicator">
              <span className="pulse-dot" /> LIVE DISPATCH
            </span>
          </div>
        </div>

        <div className="appbar-actions">
          <button
            onClick={() => setShowWalkinModal(true)}
            className="appbar-btn-primary"
          >
            <LuxuryIcon name="lightning" size={14} color="#000" />
            + QUICK WALK-IN
          </button>

          <button
            onClick={() => setShowStats(true)}
            className="appbar-icon-btn"
            title="Financial Insights & Splits"
          >
            <LuxuryIcon name="diamond" size={13} color="#c5a059" />
            <span>INSIGHTS</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="appbar-icon-btn"
            title="Export Daily Financial Statement"
          >
            <LuxuryIcon name="download" size={13} color="#c5a059" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="appbar-icon-btn"
            title="View Public Salon Site"
          >
            <span>SITE ↗</span>
          </button>

          <button
            onClick={() => {
              setIsAdmin(false);
              localStorage.removeItem("barber_admin");
              toast.info("Logged out of staff session.");
            }}
            className="appbar-icon-btn destructive"
            title="Logout"
          >
            <span>LOGOUT</span>
          </button>
        </div>
      </header>

      {/* --- EXECUTIVE KPI METRICS ROW --- */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">TODAY'S TOTAL TURNOVER</span>
            <LuxuryIcon name="sparkle" size={14} color="#22c55e" />
          </div>
          <div className="kpi-value" style={{ color: "#22c55e" }}>
            ₦{kpis.totalDayValue.toLocaleString()}
          </div>
          <span className="kpi-subtext">
            Settled: ₦{stats.revenue.toLocaleString()} • Pending: ₦{projectedRevenue.toLocaleString()}
          </span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">IN-CHAIR NOW</span>
            <LuxuryIcon name="scissors" size={14} color="#38bdf8" />
          </div>
          <div className="kpi-value" style={{ color: "#38bdf8" }}>
            {kpis.inChairCount} Active
          </div>
          <span className="kpi-subtext">Currently receiving treatments</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">WAITING IN QUEUE</span>
            <LuxuryIcon name="clock" size={14} color="#c5a059" />
          </div>
          <div className="kpi-value" style={{ color: "#c5a059" }}>
            {kpis.queueCount} Clients
          </div>
          <span className="kpi-subtext">Scheduled & awaiting seating</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">SETTLED SESSIONS</span>
            <LuxuryIcon name="check" size={14} color="#fff" />
          </div>
          <div className="kpi-value">
            {history.length} Done
          </div>
          <span className="kpi-subtext">Completed on {selectedDate}</span>
        </div>
      </section>

      {/* --- SEGMENTED TABS (MOBILE & DESKTOP SWITCHER) --- */}
      <nav className="segmented-nav">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`segmented-tab ${activeTab === "queue" ? "active" : ""}`}
        >
          <LuxuryIcon name="lightning" size={13} color={activeTab === "queue" ? "#c5a059" : "#888"} />
          <span>LIVE QUEUE ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`segmented-tab ${activeTab === "audit" ? "active" : ""}`}
        >
          <LuxuryIcon name="diamond" size={13} color={activeTab === "audit" ? "#c5a059" : "#888"} />
          <span>FINANCIAL AUDIT</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("messages")}
          className={`segmented-tab ${activeTab === "messages" ? "active" : ""}`}
        >
          <LuxuryIcon name="crown" size={13} color={activeTab === "messages" ? "#c5a059" : "#888"} />
          <span>INQUIRIES</span>
          {unreadMessagesCount > 0 && (
            <span className="tab-badge">{unreadMessagesCount}</span>
          )}
        </button>
      </nav>

      {/* --- TAB 1: LIVE QUEUE & IN-CHAIR DISPATCH --- */}
      {activeTab === "queue" && (
        <div>
          {/* Date controls bar */}
          <div className="date-control-bar">
            <div className="date-preset-group">
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className={`date-preset-btn ${selectedDate === new Date().toISOString().split("T")[0] ? "active" : ""}`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const y = new Date();
                  y.setDate(y.getDate() - 1);
                  setSelectedDate(y.toISOString().split("T")[0]);
                }}
                className="date-preset-btn"
              >
                Yesterday
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 700 }}>DATE:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input-picker"
              />
            </div>
          </div>

          <div className="admin-main-grid">
            {/* LEFT COLUMN: ACTIVE SESSIONS */}
            <div>
              <div className="section-header-row">
                <h3 className="section-headline">
                  <LuxuryIcon name="chair" size={16} color="#c5a059" />
                  Active Appointments ({bookings.length})
                </h3>
              </div>

              <div className="bookings-grid">
                {bookings.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", padding: "50px 20px", textAlign: "center", border: "1px dashed #222", borderRadius: "12px", background: "#0c0c0c" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <LuxuryIcon name="chair" size={32} color="#c5a059" />
                    </div>
                    <h4 className="serif" style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 6px" }}>All Chairs Available</h4>
                    <p style={{ fontSize: "0.8rem", color: "#777", margin: "0 auto", maxWidth: "340px" }}>
                      No active reservations queued for {selectedDate}. Use "+ QUICK WALK-IN" to seat an in-person guest.
                    </p>
                  </div>
                ) : (
                  bookings.map((b) => {
                    const isInChair = b.status === "in-chair";

                    return (
                      <div
                        key={b.id}
                        className={`booking-card ${isInChair ? "in-chair" : ""}`}
                      >
                        <div>
                          <div className="booking-card-top">
                            <span className="time-slot-badge">
                              <LuxuryIcon name="clock" size={12} color={isInChair ? "#22c55e" : "#c5a059"} />
                              {b.time}
                            </span>
                            <span className="booking-price-tag">
                              ₦{Number(b.price || 0).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="booking-client-name">{b.customerName}</h3>
                          <p className="booking-service-title">{b.service}</p>

                          <div className="booking-meta-row" style={{ marginTop: "8px" }}>
                            <span>Artisan: <strong className="meta-artisan">{b.artisan}</strong></span>
                            {b.phone && b.phone !== "Walk-in Guest" && (
                              <a href={`tel:${b.phone}`} className="meta-phone">
                                <LuxuryIcon name="phone" size={11} color="#888" />
                                {b.phone}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* IN-CHAIR LIVE COUNTDOWN */}
                        {isInChair && (
                          <div className="session-timer-box">
                            <span style={{ fontSize: "0.65rem", color: "#888", display: "block", letterSpacing: "1px", textTransform: "uppercase" }}>
                              TIME REMAINING IN CHAIR
                            </span>
                            <SessionTimer
                              startTime={b.sessionStartedAt}
                              duration={b.duration}
                              onTimeUp={() => {
                                soundEffects.playSessionReadyAlert();
                                toast.info(`Session for ${b.customerName} has reached allocated time.`);
                              }}
                            />
                          </div>
                        )}

                        {/* CONTROLS */}
                        <div className="card-actions-row">
                          <button
                            type="button"
                            onClick={() => {
                              const newStatus = b.status === "active" ? "in-chair" : "completed";
                              const updateData: any = { status: newStatus };
                              if (newStatus === "in-chair") {
                                updateData.sessionStartedAt = serverTimestamp();
                                soundEffects.playSuccessChime();
                                toast.success(`${b.customerName} seated with ${b.artisan}`);
                              } else {
                                updateData.completedAt = serverTimestamp();
                                soundEffects.playSuccessChime();
                                toast.success(`Session completed & settled for ${b.customerName}!`);
                              }
                              updateDoc(doc(db, "bookings", b.id), updateData);
                            }}
                            className="btn-primary-action"
                          >
                            <LuxuryIcon name={b.status === "active" ? "lightning" : "check"} size={13} color={isInChair ? "#fff" : "#000"} />
                            {b.status === "active" ? "SEAT IN CHAIR" : "COMPLETE & SETTLE"}
                          </button>

                          <div className="card-secondary-group">
                            <button
                              type="button"
                              onClick={() => handleDelaySession(b)}
                              className="btn-secondary-action"
                              title="Delay 15 Minutes"
                            >
                              +15m
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMarkNoShow(b.id, b.customerName)}
                              className="btn-secondary-action danger"
                              title="Mark No-Show"
                            >
                              No-Show
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteBooking(b.id)}
                              className="btn-secondary-action danger"
                              title="Delete Record"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: QUICK SETTLED OVERVIEW */}
            <div className="audit-container">
              <div className="section-header-row">
                <h3 className="section-headline" style={{ fontSize: "0.95rem" }}>
                  <LuxuryIcon name="check" size={14} color="#22c55e" />
                  Settled Today ({history.length})
                </h3>
                <span style={{ fontSize: "0.85rem", color: "#22c55e", fontWeight: 800 }}>
                  ₦{stats.revenue.toLocaleString()}
                </span>
              </div>

              <div className="audit-history-list">
                {history.length === 0 ? (
                  <p style={{ color: "#666", fontSize: "0.78rem", textAlign: "center", padding: "20px" }}>
                    No sessions settled yet for this date.
                  </p>
                ) : (
                  history.slice(0, 8).map((h: any) => (
                    <div key={h.id} className="history-card-item">
                      <div className="history-client-info">
                        <h5>{h.customerName}</h5>
                        <p>{h.artisan} • {h.service}</p>
                      </div>
                      <div className="history-amount-badge">
                        <span className="amount">+₦{Number(h.price || 0).toLocaleString()}</span>
                        <span className="time">{h.displayTime}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: FINANCIAL AUDIT & COMMISSION STATEMENT --- */}
      {activeTab === "audit" && (
        <div className="audit-container">
          <div className="section-header-row" style={{ flexWrap: "wrap", gap: "12px", marginBottom: "1.5rem" }}>
            <div>
              <h2 className="serif" style={{ fontSize: "1.4rem", margin: "0 0 4px" }}>
                Financial Atelier Audit
              </h2>
              <p style={{ color: "#888", fontSize: "0.78rem", margin: 0 }}>
                Gross collections, net salon revenue, and artisan commission ledger for {selectedDate}.
              </p>
            </div>

            <button
              onClick={handleExportPDF}
              className="appbar-btn-primary"
            >
              <LuxuryIcon name="download" size={14} color="#000" />
              DOWNLOAD PDF REPORT
            </button>
          </div>

          <div className="audit-kpi-summary">
            <div>
              <span className="kpi-label">GROSS SETTLED REVENUE</span>
              <div className="kpi-value" style={{ color: "#22c55e" }}>
                ₦{stats.revenue.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="kpi-label">SALON NET SHARE ({100 - commissionRate}%)</span>
              <div className="kpi-value" style={{ color: "#c5a059" }}>
                ₦{Math.round(stats.revenue * ((100 - commissionRate) / 100)).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ background: "#070707", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="kpi-label">ARTISAN COMMISSION SPLIT POOL ({commissionRate}%)</span>
              <span style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 800 }}>
                ₦{Math.round(stats.revenue * (commissionRate / 100)).toLocaleString()}
              </span>
            </div>
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

          <h4 style={{ fontSize: "0.9rem", letterSpacing: "1px", color: "#fff", marginBottom: "12px", textTransform: "uppercase" }}>
            Artisan Earnings Breakdown
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", marginBottom: "2rem" }}>
            {Object.entries(stats.barberEarnings).map(([name, val]: [string, any]) => {
              const artisanCut = Math.round(val * (commissionRate / 100));
              const percentage = stats.revenue > 0 ? Math.round((val / stats.revenue) * 100) : 0;

              return (
                <div key={name} style={{ background: "#070707", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}>{name}</span>
                    <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.85rem" }}>₦{val.toLocaleString()} gross</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 600 }}>
                    Payout ({commissionRate}%): ₦{artisanCut.toLocaleString()}
                  </div>
                  <div className="commission-progress-bar">
                    <div className="commission-progress-fill" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <h4 style={{ fontSize: "0.9rem", letterSpacing: "1px", color: "#fff", marginBottom: "12px", textTransform: "uppercase" }}>
            Complete Settled Transactions Log ({history.length})
          </h4>

          <div className="audit-history-list">
            {history.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "20px", fontSize: "0.82rem" }}>
                No completed records for {selectedDate}.
              </p>
            ) : (
              history.map((h: any) => (
                <div key={h.id} className="history-card-item">
                  <div className="history-client-info">
                    <h5>{h.customerName}</h5>
                    <p>{h.artisan} • {h.service} • {h.phone || "Walk-in"}</p>
                  </div>
                  <div className="history-amount-badge">
                    <span className="amount">+₦{Number(h.price || 0).toLocaleString()}</span>
                    <span className="time">{h.displayTime}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: CONCIERGE INQUIRIES --- */}
      {activeTab === "messages" && (
        <div className="messages-wrapper">
          <div className="section-header-row">
            <h3 className="section-headline">
              <LuxuryIcon name="crown" size={16} color="#c5a059" />
              Concierge Inquiries ({messages.length})
            </h3>
          </div>

          {messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#0c0c0c", borderRadius: "12px", border: "1px dashed #222" }}>
              <p style={{ color: "#666", margin: 0, fontSize: "0.85rem" }}>
                No guest messages or inquiries in the inbox.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`inbox-card ${m.status === "unread" ? "unread" : ""}`}
              >
                <div className="inbox-card-header">
                  <div>
                    <h4 style={{ margin: "0 0 2px", color: "#c5a059", fontSize: "1rem", fontWeight: 700 }}>
                      {m.name || "Guest"}
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>
                      {m.email} {m.phone && `• ${m.phone}`}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {m.status === "unread" && (
                      <button
                        type="button"
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
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        MARK READ
                      </button>
                    )}

                    <button
                      type="button"
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
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>

                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff", margin: "10px 0 6px" }}>
                  {m.subject}
                </p>
                <p style={{ color: "#bbb", fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>
                  {m.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- QUICK WALK-IN MODAL --- */}
      {showWalkinModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
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
              borderRadius: "16px",
              padding: "clamp(20px, 4vw, 32px)",
              maxWidth: "460px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 className="serif" style={{ fontSize: "1.3rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <LuxuryIcon name="lightning" size={16} color="#c5a059" />
                Quick <span className="gold-text">Walk-in Entry</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowWalkinModal(false)}
                style={{ background: "none", border: "none", color: "#666", fontSize: "1.2rem", cursor: "pointer", padding: "4px" }}
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
                      fontSize: "16px",
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
                    placeholder="e.g. 08116079309"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#050505",
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
                      fontSize: "16px",
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
                      fontSize: "16px",
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
                    className="btn-secondary-action"
                    style={{ flex: 1, padding: "12px" }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={walkinLoading}
                    className="appbar-btn-primary"
                    style={{ flex: 1, padding: "12px", justifyContent: "center" }}
                  >
                    {walkinLoading ? "QUEUING..." : "ADD TO QUEUE"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- STATS DRAWER (FOR QUICK DRILL-DOWN) --- */}
      <div className={`stats-drawer ${showStats ? "open" : ""}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">FINANCIAL INSIGHTS</h2>
          <button
            onClick={() => setShowStats(false)}
            className="drawer-close-btn"
          >
            ✕
          </button>
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

        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "20px 0" }} />

        <button
          onClick={handleExportPDF}
          className="appbar-btn-primary"
          style={{ width: "100%", marginBottom: "10px", justifyContent: "center" }}
        >
          <LuxuryIcon name="download" size={14} color="#000" />
          EXPORT OFFICIAL PDF STATEMENT
        </button>

        <button
          onClick={handleCleanup}
          style={{
            width: "100%",
            background: "transparent",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.3)",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          PURGE ARCHIVED RECORDS (&gt;30 DAYS)
        </button>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, color }: any) => (
  <div style={{ marginBottom: "16px" }}>
    <div style={{ fontSize: "0.65rem", color: "#888", letterSpacing: "1px", marginBottom: "2px", textTransform: "uppercase" }}>
      {label}
    </div>
    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: color, fontFamily: "'Playfair Display', serif" }}>
      ₦{Number(value || 0).toLocaleString()}
    </div>
  </div>
);

export default AdminDashboard;
