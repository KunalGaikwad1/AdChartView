"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function NotificationPermission() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // @ts-ignore
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    // @ts-ignore
    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          notifyButton: { enable: true },
          allowLocalhostAsSecureOrigin: true,
        });

        console.log("✅ OneSignal initialized");

        // Prompt user for permission
        OneSignal.Notifications.requestPermission();

        // Listen for permission and subscription updates
        OneSignal.Notifications.addEventListener(
          "permissionChange",
          (permission: any) => {
            console.log("🔔 Permission changed:", permission);
          }
        );

        OneSignal.User.PushSubscription.addEventListener(
          "change",
          async (subscription: any) => {
            const userId = OneSignal.User.PushSubscription.id;
            console.log("📨 Push subscription changed. New ID:", userId);

            if (userId) {
              const res = await fetch("/api/saveOneSignalId", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oneSignalUserId: userId }),
              });

              const data = await res.json();
              console.log("✅ Backend response:", data);
              toast({ title: "Notifications Enabled 🔔" });
            }
          }
        );
      } catch (err) {
        console.error("❌ OneSignal init error:", err);
      }
    });
  }, []);

  return null;
}
