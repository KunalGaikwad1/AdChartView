"use client";

import { useEffect } from "react";
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

export default function NotificationPermission() {
  useEffect(() => {
    // 👇 Stop if Firebase messaging not initialized
    if (!messaging) return;

    const askPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // ✅ Safely assert type
          const token = await getToken(messaging as Messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (token) {
            await fetch("/api/saveToken", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });

            toast({ title: "Notifications Enabled 🔔" });
          }
        } else {
          toast({ title: "Notifications Disabled" });
        }
      } catch (error) {
        console.error("Error during permission request:", error);
      }
    };

    askPermission();

    // ✅ Foreground push message listener
    const unsubscribe = onMessage(messaging as Messaging, (payload) => {
      if (payload.notification?.title) {
        toast({
          title: payload.notification.title,
          description: payload.notification.body,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
