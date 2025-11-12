"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function NotificationPermission() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // @ts-ignore
    import("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js").then(() => {
      // @ts-ignore
      const OneSignal = window.OneSignal || [];

      // @ts-ignore
      OneSignal.push(() => {
        console.log("✅ OneSignal initializing...");
        // @ts-ignore
        OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          notifyButton: { enable: true },
          allowLocalhostAsSecureOrigin: true,
        });

        // Prompt user for permission
        // @ts-ignore
        OneSignal.Slidedown.promptPush();

        // Detect subscription
        // @ts-ignore
        OneSignal.User.PushSubscription.addEventListener("change", async (event: any) => {
          const id = event.current.id;
          if (id) {
            console.log("🪪 User ID:", id);
            try {
              const res = await fetch("/api/saveOneSignalId", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oneSignalUserId: id }),
              });
              const data = await res.json();
              console.log("✅ Backend response:", data);
              toast({ title: "Notifications Enabled 🔔" });
            } catch (err) {
              console.error("❌ Error saving ID:", err);
            }
          }
        });
      });
    });
  }, []);

  return null;
}
