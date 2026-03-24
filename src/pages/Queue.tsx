import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

interface Booking {
  id: string;
  customerName: string;
  service: string;
  timestamp: any;
  status: string;
}

const Queue: React.FC = () => {
  const [queue, setQueue] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Create a query: Get bookings where status is 'active', sorted by time
    const q = query(
      collection(db, "bookings"),
      where("status", "==", "active"),
      orderBy("timestamp", "asc")
    );

    // 2. Listen for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData: Booking[] = [];
      snapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setQueue(bookingsData);
      setLoading(false);
    });

    // 3. Clean up the listener when the page closes
    return () => unsubscribe();
  }, []);

  return (
    <div className="queue-wrapper">
      <div className="container">
        <div className="queue-header">
          <span className="gold-text eyebrow">LIVE FROM THE SHOP</span>
          <h2 className="serif">
            The <span className="gold-text">Waiting List</span>
          </h2>
        </div>

        {loading ? (
          <p style={{ color: "white", textAlign: "center" }}>
            Loading the queue...
          </p>
        ) : (
          <div className="queue-list">
            {queue.length === 0 ? (
              <div className="empty-state">
                No one in the queue. You're up next!
              </div>
            ) : (
              queue.map((person, index) => (
                <div
                  key={person.id}
                  className={`queue-card ${index === 0 ? "now-serving" : ""}`}
                >
                  <div className="queue-info">
                    <span className="queue-number">#{index + 1}</span>
                    <div>
                      <h3 className="customer-name">{person.customerName}</h3>
                      <p className="service-type">{person.service}</p>
                    </div>
                  </div>
                  <div className="queue-status">
                    {index === 0 ? "IN CHAIR" : "WAITING"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        .queue-wrapper { padding: 150px 5% 80px; background: #050505; min-height: 100vh; color: white; }
        .queue-header { text-align: center; margin-bottom: 3rem; }
        .queue-list { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
        .queue-card { 
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem; background: #0c0c0c; border: 1px solid rgba(197, 160, 89, 0.1);
          transition: 0.3s;
        }
        .now-serving { border-color: #c5a059; background: rgba(197, 160, 89, 0.05); transform: scale(1.02); }
        .queue-info { display: flex; align-items: center; gap: 1.5rem; }
        .queue-number { font-size: 1.5rem; font-weight: bold; color: #c5a059; width: 40px; }
        .customer-name { font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px; }
        .service-type { color: #888; font-size: 0.8rem; margin-top: 4px; }
        .queue-status { font-weight: bold; font-size: 0.7rem; letter-spacing: 2px; color: #c5a059; border: 1px solid #c5a059; padding: 4px 12px; }
        .empty-state { text-align: center; padding: 4rem; border: 2px dashed rgba(197, 160, 89, 0.2); color: #888; }
      `}</style>
    </div>
  );
};

export default Queue;
