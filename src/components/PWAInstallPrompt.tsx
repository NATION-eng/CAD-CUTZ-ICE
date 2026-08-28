import React, { useState, useEffect } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import "./PWAInstallPrompt.css";

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, promptInstall, dismiss } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [success, setSuccess] = useState(false);

  // Show prompt after first user interaction (touch or click)
  useEffect(() => {
    if (!isInstallable) return;

    const showOnInteraction = () => {
      setVisible(true);
      // Remove listeners once shown
      document.removeEventListener("touchstart", showOnInteraction);
      document.removeEventListener("mousedown", showOnInteraction);
      document.removeEventListener("scroll", showOnInteraction);
    };

    // Short delay so page loads before popping up
    const timer = setTimeout(() => {
      document.addEventListener("touchstart", showOnInteraction, { once: true });
      document.addEventListener("mousedown", showOnInteraction, { once: true });
      document.addEventListener("scroll", showOnInteraction, { once: true, passive: true });

      // Also auto-show after 4 seconds even without interaction
      setTimeout(() => {
        setVisible(true);
      }, 4000);
    }, 1500);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("touchstart", showOnInteraction);
      document.removeEventListener("mousedown", showOnInteraction);
      document.removeEventListener("scroll", showOnInteraction);
    };
  }, [isInstallable]);

  const handleInstall = async () => {
    setInstalling(true);
    const outcome = await promptInstall();
    setInstalling(false);

    if (outcome === "accepted") {
      setSuccess(true);
      setTimeout(() => setVisible(false), 2500);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    dismiss();
  };

  if (!isInstallable || !visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="pwa-backdrop" onClick={handleDismiss} />

      {/* Install Bottom Sheet */}
      <div className={`pwa-sheet ${visible ? "pwa-sheet--visible" : ""}`}>
        {success ? (
          <div className="pwa-success">
            <div className="pwa-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="pwa-success-title">Installed Successfully!</h3>
            <p className="pwa-success-sub">CAD CUTZ & ICE is now on your home screen.</p>
          </div>
        ) : (
          <>
            {/* Handle bar */}
            <div className="pwa-handle" />

            {/* Top Row */}
            <div className="pwa-header">
              <div className="pwa-app-identity">
                <div className="pwa-app-icon">
                  <img src="/icons/icon-192x192.png" alt="CAD CUTZ & ICE" width="52" height="52" />
                </div>
                <div className="pwa-app-info">
                  <span className="pwa-app-name">CAD CUTZ & ICE</span>
                  <span className="pwa-app-domain">cadcutz.app • Free</span>
                </div>
              </div>
              <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Dismiss">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="pwa-features">
              <div className="pwa-feature-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>Instant Booking</span>
              </div>
              <div className="pwa-feature-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Live Queue</span>
              </div>
              <div className="pwa-feature-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
                <span>Works Offline</span>
              </div>
            </div>

            {/* Description */}
            <p className="pwa-description">
              Add <strong>CAD CUTZ & ICE</strong> to your home screen for the full luxury experience — no App Store required.
            </p>

            {/* Actions */}
            <div className="pwa-actions">
              <button
                className="pwa-install-btn"
                onClick={handleInstall}
                disabled={installing}
              >
                {installing ? (
                  <>
                    <span className="pwa-spinner" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>ADD TO HOME SCREEN</span>
                  </>
                )}
              </button>

              <button className="pwa-later-btn" onClick={handleDismiss}>
                Not now
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PWAInstallPrompt;
