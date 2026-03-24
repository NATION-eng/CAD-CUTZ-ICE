import React, { useState, useEffect } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./Stats.css";

const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

const CountUp: React.FC<{ end: number; duration: number; suffix?: string; isVisible: boolean }> = ({
  end,
  duration,
  suffix = "",
  isVisible,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      setCount(Math.floor(easedProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, isVisible]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const Stats: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section className="stats-section" ref={ref}>
      <div className="container stats-grid">
        <div className={`stat-item ${isVisible ? "visible" : ""}`}>
          <h2 className="stat-value">
            <CountUp end={5000} duration={3000} suffix="+" isVisible={isVisible} />
          </h2>
          <p className="stat-label">HEADS GROOMED</p>
        </div>

        <div className={`stat-item ${isVisible ? "visible" : ""}`}>
          <h2 className="stat-value">
            <CountUp end={12} duration={2500} suffix="+" isVisible={isVisible} />
          </h2>
          <p className="stat-label">MASTER BARBERS</p>
        </div>

        <div className={`stat-item ${isVisible ? "visible" : ""}`}>
          <h2 className="stat-value">COUNTLESS</h2>
          <p className="stat-label">STORYTELLERS</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;
