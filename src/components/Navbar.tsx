"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, LogOut, Shield, Menu, X, User } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevHadUserRef = useRef<boolean>(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
      variant: "success",
    });
    router.push("/");
  };

  // Show a one-time success toast when the user signs in
  useEffect(() => {
    if (!authLoading && user && !prevHadUserRef.current) {
      toast({
        title: "Signed in",
        description: user.name ? `Welcome, ${user.name}!` : "Welcome!",
        variant: "success",
      });
      prevHadUserRef.current = true;
    }
    if (!user && !authLoading) {
      prevHadUserRef.current = false;
    }
  }, [authLoading, user, toast]);

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
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg shadow-sm">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-foreground">AdChartView</span>
            <small className="text-xs text-muted-foreground -mt-1">Actionable stock ideas</small>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
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

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.name ?? 'Account'}</span>
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button variant="default">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((s) => !s)}
            className="p-2 rounded-md hover:bg-accent/50"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="absolute left-4 right-4 top-16 z-50 md:hidden">
            <Card className="p-3">
              <div className="flex flex-col gap-2">
                <Link href="/tips">
                  <Button variant="ghost" className="w-full" onClick={() => setMobileOpen(false)}>
                    View Tips
                  </Button>
                </Link>

                {user ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin/dashboard">
                        <Button variant="ghost" className="w-full" onClick={() => setMobileOpen(false)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Admin
                        </Button>
                      </Link>
                    )}

                    <Button variant="ghost" className="w-full" onClick={() => { setMobileOpen(false); handleLogout(); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="default" className="w-full" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </nav>
  );
}
