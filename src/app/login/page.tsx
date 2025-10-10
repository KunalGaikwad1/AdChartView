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
  const role = (session.user as { role?: string | null } | undefined)?.role || undefined;
      if (role === "admin") router.replace("/admin/dashboard");
      else router.replace("/user");
    }
  }, [session, router]);

  // If NextAuth redirected back with an error param, show destructive toast
  useEffect(() => {
    const err = search?.get("error");
    if (err) {
      toast({ title: "Sign in failed", description: err, variant: "destructive" });
    }
  }, [search, toast]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">AdChartView</span>
          </div>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in with Google to access premium stock tips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={() => signIn("google")}
          >
            <FcGoogle className="h-6 w-6" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
