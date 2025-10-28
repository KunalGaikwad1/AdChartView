"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function NotificationPermission() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // @ts-ignore
    window.OneSignal = window.OneSignal || [];

    // @ts-ignore
    OneSignal.push(function () {
      // @ts-ignore
      OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        notifyButton: { enable: true },
        allowLocalhostAsSecureOrigin: true,
      });

      // Prompt user for notification permission
      // @ts-ignore
      OneSignal.showNativePrompt();

      // Handle subscription status
      // @ts-ignore
      OneSignal.on("subscriptionChange", function (isSubscribed: boolean) {
        if (isSubscribed) {
          // @ts-ignore
          OneSignal.getUserId().then(function (userId: string) {
            if (userId) {
              fetch("/api/saveOneSignalId", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oneSignalUserId: userId }),
              });
              toast({ title: "Notifications Enabled 🔔" });
            }
          });
        } else {
          toast({ title: "Notifications Disabled" });
        }
      });
    });
  }, []);

  return null;
}
