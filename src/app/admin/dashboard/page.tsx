"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Eye, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";

interface DashboardStats {
  totalUsers: number;
  activeSubscribers: number;
  totalRevenue: number;
  totalTips: number;
  demoTips: number;
  recentLogins: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    totalTips: 0,
    demoTips: 0,
    recentLogins: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* ===== Top Stats ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscribers
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscribers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTips}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.demoTips} demo tips
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Logins (24h)
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentLogins}</div>
            </CardContent>
          </Card>
        </div>

        {/* ===== Navigation Cards ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:bg-muted/50 transition"
            onClick={() => router.push("/admin/transaction-history")}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold">Transaction History</h3>
              <p className="text-sm text-muted-foreground">
                View all subscription transactions
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition"
            onClick={() => router.push("/admin/login-history")}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold">Login History</h3>
              <p className="text-sm text-muted-foreground">
                Track user login activities
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition"
            onClick={() => router.push("/admin/active-subscribers")}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold">Active Subscribers</h3>
              <p className="text-sm text-muted-foreground">
                View all active subscribers
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition"
            onClick={() => router.push("/admin/manage-tips")}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold">Manage Tips</h3>
              <p className="text-sm text-muted-foreground">
                Post and manage stock tips
              </p>
            </CardContent>
          </Card>

          {/* ✅ NEW Subscription Plans Card */}
          <Card
            className="cursor-pointer hover:bg-muted/50 transition"
            onClick={() => router.push("/admin/subscriptions")}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Manage Subscription Plans
              </h3>
              <p className="text-sm text-muted-foreground">
                Create, update or remove user subscription plans
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
