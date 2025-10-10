"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();

  // Redirect after login based on role
  useEffect(() => {
    if (session) {
      const role =
        (session.user as { role?: string | null } | undefined)?.role ||
        undefined;
      if (role === "admin") router.replace("/admin/dashboard");
      else router.replace("/user");
    }
  }, [session, router]);

  // Show toast if error
  useEffect(() => {
    const err = search?.get("error");
    if (err) {
      toast({
        title: "Sign in failed",
        description: err,
        variant: "destructive",
      });
    }
  }, [search, toast]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-800 to-slate-700 p-4">
      <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg shadow-md">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">
              AdChartView
            </span>
          </div>
          <CardTitle className="text-white text-xl">Welcome</CardTitle>
          <CardDescription className="text-gray-300 text-sm">
            Sign in with Google to access premium stock tips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6 bg-white text-gray-800 border border-white/30 hover:bg-white/95 hover:border-white/50 shadow-sm"
            onClick={() => signIn("google")}
          >
            <FcGoogle className="h-6 w-6" />
            <span className="text-sm text-white">Continue with Google</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
