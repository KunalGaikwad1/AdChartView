"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, DollarSign, Eye, Crown, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-lg font-medium">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 pt-20">
      <Navbar />

      <div className="container mx-auto px-6 py-10">
        {/* ==== Header Section ==== */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {session?.user?.name || "Admin"} 👋
            </p>
          </div>
        </motion.div>

        {/* ==== Stats Section ==== */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {[
            {
              title: "Total Users",
              value: stats.totalUsers,
              icon: <Users className="h-5 w-5 text-sky-500" />,
              gradient: "from-sky-500/10 to-blue-500/5",
            },
            {
              title: "Active Subscribers",
              value: stats.activeSubscribers,
              icon: <TrendingUp className="h-5 w-5 text-green-500" />,
              gradient: "from-green-500/10 to-emerald-500/5",
            },
            {
              title: "Total Revenue",
              value: `₹${stats.totalRevenue.toFixed(2)}`,
              icon: <DollarSign className="h-5 w-5 text-yellow-500" />,
              gradient: "from-yellow-500/10 to-amber-500/5",
            },
            {
              title: "Total Tips",
              value: stats.totalTips,
              sub: `${stats.demoTips} demo tips`,
              icon: <Eye className="h-5 w-5 text-purple-500" />,
              gradient: "from-purple-500/10 to-indigo-500/5",
            },
            {
              title: "Recent Logins",
              value: stats.recentLogins,
              icon: <Clock className="h-5 w-5 text-pink-500" />,
              gradient: "from-pink-500/10 to-rose-500/5",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card
                className={`bg-gradient-to-br ${stat.gradient} border border-border/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  {stat.sub && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.sub}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ==== Quick Navigation Section ==== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Transaction History",
              desc: "View all subscription transactions",
              icon: <DollarSign className="h-5 w-5 text-green-600" />,
              path: "/admin/transaction-history",
            },
            {
              title: "Login History",
              desc: "Track user login activities",
              icon: <Clock className="h-5 w-5 text-purple-600" />,
              path: "/admin/login-history",
            },
            {
              title: "Active Subscribers",
              desc: "View all active subscribers",
              icon: <Users className="h-5 w-5 text-blue-600" />,
              path: "/admin/active-subscribers",
            },
            {
              title: "Manage Tips",
              desc: "Post and manage stock tips",
              icon: <Eye className="h-5 w-5 text-indigo-600" />,
              path: "/admin/manage-tips",
            },
            {
              title: "Subscription Plans",
              desc: "Create, update or remove user plans",
              icon: <Crown className="h-5 w-5 text-yellow-500" />,
              path: "/admin/subscriptions",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => router.push(item.path)}
                className="cursor-pointer group border border-border/40 bg-card/70 backdrop-blur-sm hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <CardContent className="pt-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.icon}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
