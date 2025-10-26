"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

let socket: any;

interface Notification {
  _id: string;
  message: string;
  seen: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchNotifications();

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");
    socket.emit("joinRoom", session.user.id);

    socket.on("newNotification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, [session?.user?.id]);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data);
    setLoading(false);
  };

  const markAllAsSeen = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <Button onClick={markAllAsSeen} variant="outline">
            Mark all as read
          </Button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-muted-foreground text-center mt-12">
            No notifications yet.
          </p>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <Card
                key={n._id}
                className={`border ${
                  n.seen ? "border-gray-200" : "border-green-400"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle
                    className={`text-base ${
                      n.seen ? "text-gray-500" : "text-foreground"
                    }`}
                  >
                    {n.message}
                  </CardTitle>
                  {!n.seen && <CheckCircle className="h-4 w-4 text-green-500" />}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
