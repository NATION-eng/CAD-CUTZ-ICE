import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const PWAHandler = () => {
  useEffect(() => {
    let deferredPrompt: any;

    const handleInstallPrompt = (e: any) => {
      // 1. Prevent the default mini-bar
      e.preventDefault();
      // 2. Stash the event
      deferredPrompt = e;

      // 3. Define the function that fires on user gesture
      const triggerPrompt = () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(
            (choiceResult: { outcome: string }) => {
              if (choiceResult.outcome === "accepted") {
                console.log("CAD CUTZ & ICE Installed");
              }
              deferredPrompt = null;
            },
          );
        }
      };

      // 4. Trigger on the VERY FIRST click or touch
      window.addEventListener("click", triggerPrompt, { once: true });
      window.addEventListener("touchstart", triggerPrompt, { once: true });
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  return null;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PWAHandler />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
