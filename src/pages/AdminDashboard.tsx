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
} from "firebase/firestore";
import "./AdminDashboard.css";
import { useNotifications } from "../hooks/useNotifications";

// --- HELPERS ---
const parseTimeWithDate = (timeStr: string, dateStr: string) => {
  if (!timeStr) return new Date();
  
  // Handle "14:30" vs "2:30 PM"
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

// --- COMPONENTS ---
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
        setTimeLeft("TIME UP");
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
  
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("barber_admin") === "true",
  );
  const [password, setPassword] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [projectedRevenue, setProjectedRevenue] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    barberEarnings: {} as Record<string, number>,
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  const ADMIN_SECRET = "CAD123";
  const prevBookingsCount = useRef<number | null>(null);
  const prevMessagesCount = useRef<number | null>(null);
  const alertedBookings = useRef(new Set());

  const playAlert = () => {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
    audio.play().catch(() => {});
    if ("vibrate" in navigator) navigator.vibrate(200);
  };

  const handleCleanup = async () => {
    const confirm = window.confirm(
      "Permanently delete completed records older than 30 days?",
    );
    if (!confirm) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const q = query(
        collection(db, "bookings"),
        where("status", "==", "completed"),
        where("completedAt", "<=", Timestamp.fromDate(thirtyDaysAgo)),
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();
      alert(`Cleanup successful! Removed ${snapshot.size} old records.`);
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  };

  // Ensure permission is requested on mount if already active
  useEffect(() => {
    if (isAdmin && permission === "default") {
      requestPermission();
    }
  }, [isAdmin, permission, requestPermission]);

  // 1. Session Start Alerts logic
  useEffect(() => {
    if (!isAdmin) return;
    const precisionClock = setInterval(() => {
      const now = new Date();
      bookings.forEach((b) => {
        if (b.status === "active") {
          const scheduled = parseTimeWithDate(b.time, selectedDate);
          
          // Debug Logging
          console.log(`Checking ${b.customerName}: Now=${now.toLocaleTimeString()} Scheduled=${scheduled.toLocaleTimeString()}`);

          if (now >= scheduled && !alertedBookings.current.has(b.id)) {
            console.log("TRIGGERING ALERT FOR:", b.customerName);
            
            // PLAY ADMIN ALERT SOUND
            playAlert();
            alertedBookings.current.add(b.id);

            // TRIGGER CUSTOMER NOTIFICATION FLAG IN FIRESTORE
            updateDoc(doc(db, "bookings", b.id), { isReady: true });

            // SHOW ADMIN-SPECIFIC BROWSER NOTIFICATION
            sendNotification(`🚨 ADMIN: Session Start`, {
              body: `Time for ${b.customerName}'s ${b.time} appointment.`,
              tag: `admin-alert-${b.id}`
            });
          }
        }
      });
    }, 1000);
    return () => clearInterval(precisionClock);
  }, [isAdmin, bookings, selectedDate, sendNotification]);

  // 2. Main Data Listeners
  useEffect(() => {
    if (!isAdmin) return;

    const unsubLive = onSnapshot(
      query(
        collection(db, "bookings"),
        where("status", "in", ["active", "in-chair"]),
        where("date", "==", selectedDate),
      ),
      (snap) => {
        const currentDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const liveTotal = currentDocs.reduce(
          (acc, curr: any) => acc + (Number(curr.price) || 0),
          0,
        );
        setProjectedRevenue(liveTotal);

        if (
          prevBookingsCount.current !== null &&
          currentDocs.length > prevBookingsCount.current
        )
          playAlert();
        prevBookingsCount.current = currentDocs.length;
        setBookings(
          currentDocs.sort((a: any, b: any) => a.time.localeCompare(b.time)),
        );
      },
    );

    const unsubStats = onSnapshot(
      query(
        collection(db, "bookings"),
        where("status", "==", "completed"),
        where("date", "==", selectedDate),
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
      },
    );

    const unsubMsg = onSnapshot(
      query(collection(db, "message"), orderBy("createdAt", "desc")),
      (snap) => {
        const msgDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (
          prevMessagesCount.current !== null &&
          msgDocs.length > prevMessagesCount.current
        )
          playAlert();
        prevMessagesCount.current = msgDocs.length;
        setMessages(msgDocs);
      },
    );

    return () => {
      unsubLive();
      unsubStats();
      unsubMsg();
    };
  }, [isAdmin, selectedDate]);

  if (!isAdmin) {
    return (
      <div className="login-container">
        <h2 className="login-title">STAFF LOGIN</h2>
        <form
          className="login-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (password === ADMIN_SECRET) {
              await requestPermission();
              setIsAdmin(true);
              localStorage.setItem("barber_admin", "true");
            } else alert("Wrong Key");
          }}
        >
          <input
            type="password"
            placeholder="Key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button type="submit" className="login-btn">
            ENTER
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-tabs">
          <div
            onClick={() => setActiveTab("bookings")}
            className={`tab-item ${activeTab === "bookings" ? "active" : ""}`}
          >
            <h1 className="tab-title">QUEUE</h1>
          </div>
          <div
            onClick={() => setActiveTab("messages")}
            className={`tab-item ${activeTab === "messages" ? "active" : ""}`}
            style={{ position: "relative" }}
          >
            <h1 className="tab-title">MESSAGES</h1>
            {messages.filter((m) => m.status === "unread").length > 0 && (
              <span className="badge">
                {messages.filter((m) => m.status === "unread").length}
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate("/")} className="btn-action">
            HOME
          </button>
          <button onClick={() => setShowStats(true)} className="btn-insights">
            VIEW INSIGHTS
          </button>
          <button
            onClick={() => {
              setIsAdmin(false);
              localStorage.removeItem("barber_admin");
            }}
            className="btn-logout"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {activeTab === "bookings" ? (
        <div className="admin-dashboard-grid">
          <div>
            <div className="queue-value-card">
              <span className="label-small">
                LIVE QUEUE VALUE
              </span>
              <h2 className="big-value">
                ₦{(projectedRevenue + stats.revenue).toLocaleString()}
              </h2>
              <div className="value-detail">
                ({selectedDate} Closed: ₦{stats.revenue.toLocaleString()} +
                In-Queue: ₦{projectedRevenue.toLocaleString()})
              </div>
            </div>

            <div className="bookings-grid">
              {bookings.length === 0 ? (
                <p className="empty-state">No active sessions...</p>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="booking-card">
                    <div className="booking-card-header">
                      <span className="time-badge">
                        {b.time}
                      </span>
                      <span className="price-tag">₦{b.price}</span>
                    </div>
                    <h3 className="customer-name">
                      {b.customerName}
                    </h3>
                    <p className="service-info">
                      {b.service} • {b.artisan}
                    </p>

                    {b.status === "in-chair" && (
                      <div className="session-timer-container">
                        <SessionTimer
                          startTime={b.sessionStartedAt}
                          duration={b.duration}
                          onTimeUp={() =>
                            updateDoc(doc(db, "bookings", b.id), {
                              status: "completed",
                              completedAt: serverTimestamp(),
                            })
                          }
                        />
                      </div>
                    )}

                    <div className="card-actions">
                      <button
                        onClick={() => {
                          const newStatus =
                            b.status === "active" ? "in-chair" : "completed";
                          const updateData: any = { status: newStatus };
                          if (newStatus === "in-chair")
                            updateData.sessionStartedAt = serverTimestamp();
                          else updateData.completedAt = serverTimestamp();
                          updateDoc(doc(db, "bookings", b.id), updateData);
                        }}
                        className="btn-session"
                        style={{
                          background:
                            b.status === "in-chair" ? "#22c55e" : "#c5a059",
                        }}
                      >
                        {b.status === "active"
                          ? "START SESSION"
                          : "FINISH SESSION"}
                      </button>
                      <button
                        onClick={() =>
                          window.confirm("Delete?") &&
                          deleteDoc(doc(db, "bookings", b.id))
                        }
                        className="btn-delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="history-container">
            <div className="history-header">
              <h3 className="section-title">
                COMPLETED
              </h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="total-row">
              <span className="total-label">TOTAL:</span>
              <span className="total-value">
                ₦{stats.revenue.toLocaleString()}
              </span>
            </div>
            <div className="history-list">
              {history.map((h: any) => (
                <div key={h.id} className="history-item">
                  <div className="history-top">
                    <span>{h.customerName}</span>
                    <span className="history-profit">
                      +₦{Number(h.price).toLocaleString()}
                    </span>
                  </div>
                  <div className="history-bottom">
                    {h.artisan} • {h.displayTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="messages-container">
          {messages.length === 0 ? (
            <p className="empty-state">
              No messages yet...
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`message-card ${m.status === "unread" ? "unread" : ""}`}
              >
                <div className="msg-header">
                  <div>
                    <h4 className="msg-name">
                      {m.name || "Unknown Customer"}
                    </h4>
                    <p className="msg-email">
                      {m.email}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteDoc(doc(db, "message", m.id))}
                    className="msg-delete-btn"
                  >
                    DELETE
                  </button>
                </div>
                <p className="msg-subject">
                  {m.subject}
                </p>
                <p className="msg-body">
                  {m.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* STATS DRAWER */}
      <div className={`stats-drawer ${showStats ? "open" : ""}`}>
        <div className="drawer-header">
          <button
            onClick={() => setShowStats(false)}
            className="drawer-close-btn"
          >
            CLOSE ✕
          </button>
          <h2 className="drawer-title">
            INSIGHTS ({selectedDate})
          </h2>
        </div>
        
        <MiniStat label="DAILY REVENUE" value={stats.revenue} color="#eab308" />
        <hr className="divider" />
        
        <h3 className="barber-split-title">
          BARBER SPLIT
        </h3>
        {Object.entries(stats.barberEarnings).map(
          ([name, val]: [string, any]) => (
            <div key={name} className="barber-row">
              <span className="barber-name">{name}</span>
              <span className="barber-val">
                ₦{val.toLocaleString()}
              </span>
            </div>
          ),
        )}
        <hr className="divider" />
        <button onClick={handleCleanup} className="btn-cleanup">
          CLEAR OLD HISTORY
        </button>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, color }: any) => (
  <div className="mini-stat">
    <div className="mini-stat-label">
      {label}
    </div>
    <div className="mini-stat-value" style={{ color: color }}>
      ₦{value.toLocaleString()}
    </div>
  </div>
);

export default AdminDashboard;
