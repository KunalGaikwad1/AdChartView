"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

interface LoginRecord {
  _id: string;
  user: {
    email: string;
    fullName?: string | null;
    location?: string | null;
  };
  loginAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  success: boolean;
}

export default function LoginHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") router.push("/");
    else fetchLoginHistory();
  }, [status, session]);

  const fetchLoginHistory = async () => {
    try {
      const res = await fetch("/api/admin/login-history");
      const data = await res.json();
      setLogins(data);
    } catch (error) {
      console.error("Error fetching login history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading login history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Login History</h1>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logins.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No login records found
                    </TableCell>
                  </TableRow>
                ) : (
                  logins.map((login) => (
                    <TableRow key={login._id}>
                      <TableCell>
                        {format(
                          new Date(login.loginAt),
                          "MMM dd, yyyy HH:mm:ss"
                        )}
                      </TableCell>
                      <TableCell>{login.user.fullName || "N/A"}</TableCell>
                      <TableCell>{login.user.email}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {login.user.location || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={login.success ? "default" : "destructive"}
                        >
                          {login.success ? "Success" : "Failed"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
