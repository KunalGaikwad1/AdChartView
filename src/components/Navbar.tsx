"use client";

import { Button } from "@/components/ui/button";
import { TrendingUp, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole(user);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    router.push("/");
  };

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
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            StockTips Pro
          </span>
        </Link>

        {/* Navigation buttons */}
        <div className="flex items-center gap-4">
          <Link href="/tips">
            <Button variant="ghost">View Tips</Button>
          </Link>

          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="default">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
