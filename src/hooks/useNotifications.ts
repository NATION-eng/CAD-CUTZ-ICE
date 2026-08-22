import { useState, useEffect, useCallback } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  );

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      return "denied";
    }
    console.log("Requesting Notification Permission...");
    const result = await Notification.requestPermission();
    console.log("Permission Result:", result);
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      console.log("Attempting to send notification:", title, "Permission:", permission);
      if (permission === "granted") {
        try {
          // Direct Notification for immediate feedback
          const n = new Notification(title, options);
          console.log("Notification dispatched successfully", n);
        } catch (e) {
          console.error("Notification Error:", e);
          alert("Notification failed to send: " + e);
        }
      } else {
        console.warn("Notification permission not granted");
      }
    },
    [permission]
  );

  return { permission, requestPermission, sendNotification };
}
