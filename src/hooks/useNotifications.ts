import { useState, useEffect, useCallback } from "react";

export function useNotifications() {
  const getInitialPermission = (): NotificationPermission => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      typeof Notification !== "undefined"
    ) {
      try {
        return Notification.permission;
      } catch {
        return "default";
      }
    }
    return "default";
  };

  const [permission, setPermission] = useState<NotificationPermission>(getInitialPermission);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      typeof Notification !== "undefined"
    ) {
      try {
        setPermission(Notification.permission);
      } catch {
        setPermission("default");
      }
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      typeof Notification === "undefined"
    ) {
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return "denied";
    }
  }, []);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        typeof Notification !== "undefined" &&
        permission === "granted"
      ) {
        try {
          new Notification(title, options);
        } catch {
          // Ignore silently on unsupported mobile web environments
        }
      }
    },
    [permission]
  );

  return { permission, requestPermission, sendNotification };
}
