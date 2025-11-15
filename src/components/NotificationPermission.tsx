"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function NotificationPermission() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ensure OneSignalDeferred queue exists (OneSignal page SDK uses this)
    // @ts-expect-error only in browser
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    // @ts-expect-error only in browser
    window.OneSignalDeferred.push(async function (OneSignal: any) {
      try {
        // init OneSignal with the public app id (set in Vercel as NEXT_PUBLIC_ONESIGNAL_APP_ID)
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          // optionally enable the notify button UI
          notifyButton: { enable: true },
        });

        // If push supported, check subscription
        const isSupported = await OneSignal.isPushNotificationsSupported();
        if (!isSupported) {
          console.info("Push not supported in this browser.");
          return;
        }

        // When subscription changes (user allows), save OneSignal user id to backend
        OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
          try {
            if (!isSubscribed) return;
            const oneSignalUserId = await OneSignal.getUserId();
            if (!oneSignalUserId) return;

            // Send to backend to persist against current user session
            const res = await fetch("/api/saveOneSignalId", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ oneSignalUserId }),
            });

            if (!res.ok) {
              console.error("Failed to save OneSignal ID", await res.text());
            } else {
              console.log("Saved OneSignal ID:", oneSignalUserId);
              toast({ title: "Notifications Enabled 🔔" });
            }
          } catch (err) {
            console.error("Error saving OneSignal ID:", err);
          }
        });

        // If already subscribed earlier, get the id and save it as well
        const alreadyId = await OneSignal.getUserId();
        if (alreadyId) {
          // call backend once
          try {
            await fetch("/api/saveOneSignalId", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ oneSignalUserId: alreadyId }),
            });
            console.log("Saved existing OneSignal ID:", alreadyId);
          } catch (err) {
            console.error("Saving existing OneSignal ID failed:", err);
          }
        }
      } catch (err) {
        console.error("OneSignal init error:", err);
      }
    });
  }, []);

  return null;
}
