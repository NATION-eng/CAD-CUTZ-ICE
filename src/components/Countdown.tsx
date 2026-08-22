import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string; // Format: "2024-05-20T15:30:00"
  barberName: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, barberName }) => {
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
  }, [targetDate]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const hoursPart = hours > 0 ? `${hours}:` : "";
    return `${hoursPart}${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        border: "1px solid rgba(197, 160, 89, 0.3)",
        padding: "clamp(1.2rem, 3.5vw, 2rem)",
        background: "#0c0c0c",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        maxWidth: "380px",
        margin: "0 auto",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "8px",
          height: "8px",
          borderTop: "2px solid #c5a059",
          borderLeft: "2px solid #c5a059",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "8px",
          height: "8px",
          borderTop: "2px solid #c5a059",
          borderRight: "2px solid #c5a059",
        }}
      />

      <span
        style={{
          color: "#c5a059",
          letterSpacing: "2.5px",
          fontSize: "clamp(0.62rem, 1.5vw, 0.72rem)",
          fontWeight: "bold",
          display: "block",
          textTransform: "uppercase",
        }}
      >
        SESSION: {barberName}
      </span>

      <div
        className="serif"
        style={{
          fontSize: "clamp(2.4rem, 8vw, 3.8rem)",
          color: "#c5a059",
          margin: "0.6rem 0",
          lineHeight: "1.05",
          letterSpacing: "1px",
        }}
      >
        {formatTime(seconds)}
      </div>

      <p
        style={{
          color: "#777",
          fontSize: "clamp(0.65rem, 1.4vw, 0.75rem)",
          letterSpacing: "1px",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {seconds > 0 ? "Estimated Time Remaining" : "Your session has started"}
      </p>
    </div>
  );
};

export default Countdown;
