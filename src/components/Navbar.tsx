"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, LogOut, Shield, User, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import ProfileStatusModal from "./ProfileStatusModal";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function Navbar() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const router = useRouter();
  const { toast } = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast({ title: "Logged out", description: "You have been logged out successfully.", variant: "success" });
    router.push("/");
  };

  // ✅ Welcome toast after login
  useEffect(() => {
    if (!authLoading && user) {
      const key = "justSignedIn";
      if (window.sessionStorage.getItem(key) === "1") {
        toast({ title: "Signed in", description: `Welcome, ${user.name || "User"}!`, variant: "success" });
        window.sessionStorage.removeItem(key);
      }
    }
  }, [authLoading, user, toast]);

  // ✅ Fetch profile completion status
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch("/api/user/check");
        const data = await res.json();
        setProfileCompleted(data.profileCompleted);
      } catch (err) {
        console.error("Error fetching profile status:", err);
      }
    };
    fetchProfile();
  }, [user]);

  // ✅ Fetch unseen notifications initially
  useEffect(() => {
    const fetchUnseen = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`/api/notifications/unseen?userId=${user._id}`);
        const data = await res.json();
        setUnseenCount(data.count || 0);
      } catch (err) {
        console.error("Error fetching unseen notifications:", err);
      }
    };
    fetchUnseen();
  }, [user]);

  // ✅ Socket.io connection for real-time notifications
  useEffect(() => {
    if (!user?._id) return;

    // Initialize socket once
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    }

    // Join user-specific room
    socket.emit("join", user._id);

    // Listen for new notifications
    const handleNewNotification = (data: { message: string }) => {
      setUnseenCount((prev) => prev + 1);
      toast({ title: "New Tip Added!", description: data.message });
    };

    socket.on("newNotification", handleNewNotification);

    // Cleanup on unmount
    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.emit("leave", user._id);
    };
  }, [user, toast]);

  if (authLoading || roleLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <p>Loading...</p>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/25">
            <TrendingUp className="h-5 w-5 md:h-8 md:w-8 text-emerald-400" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-foreground">AdChartView</span>
            <small className="text-xs text-muted-foreground -mt-1">Actionable stock ideas</small>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/tips">
            <Button variant="ghost">View Tips</Button>
          </Link>

          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost">
                    <Shield className="mr-2 h-4 w-4 text-primary" /> Admin
                  </Button>
                </Link>
              )}

              {/* 🔔 Notifications */}
              <div className="relative">
                <Button variant="ghost" onClick={() => router.push("/notifications")}>
                  <Bell className="h-5 w-5 text-primary" />
                </Button>
                {unseenCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full">
                    {unseenCount}
                  </span>
                )}
              </div>

              {/* 👤 Profile */}
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowProfileModal(true)}>
                <User className="h-4 w-4 text-emerald-400" />
                <span className="hidden sm:inline">{user?.name ?? "Account"}</span>
              </Button>

              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4 text-emerald-400" /> Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="default">Sign In</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileStatusModal open={showProfileModal} onClose={() => setShowProfileModal(false)} completed={profileCompleted} />
    </nav>
  );
}
