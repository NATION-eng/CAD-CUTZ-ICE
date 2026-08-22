import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string; // Format: "2024-05-20T15:30:00"
  barberName: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, barberName }) => {
  // 1. Calculate the actual seconds remaining until the target date
  const calculateSecondsLeft = () => {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = Math.floor((target - now) / 1000);
    return difference > 0 ? difference : 0;
  };

  const [seconds, setSeconds] = useState(calculateSecondsLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateSecondsLeft();
      setSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]); // Re-run if targetDate changes

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // Show hours only if there is more than 60 mins left
    const hoursPart = hours > 0 ? `${hours}:` : "";
    return `${hoursPart}${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        border: "1px solid rgba(197, 160, 89, 0.3)",
        padding: "2.5rem",
        background: "#0c0c0c",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "10px",
          height: "10px",
          borderTop: "2px solid #c5a059",
          borderLeft: "2px solid #c5a059",
        }}
      ></div>

      <span
        style={{
          color: "#c5a059",
          letterSpacing: "3px",
          fontSize: "0.7rem",
          fontWeight: "bold",
        }}
      >
        SESSION: {barberName.toUpperCase()}
      </span>

      <div
        className="serif"
        style={{
          fontSize: "4.5rem",
          color: "#c5a059",
          margin: "1rem 0",
          lineHeight: "1",
        }}
      >
        {formatTime(seconds)}
      </div>

      <p
        style={{
          color: "#666",
          fontSize: "0.75rem",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        {seconds > 0 ? "Estimated Time Remaining" : "Your session has started"}
      </p>
    </div>
  );
};

export default Countdown;
