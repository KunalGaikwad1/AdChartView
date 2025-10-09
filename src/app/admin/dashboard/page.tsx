"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // wait until session is fetched

    if (!session) {
      router.replace("/"); // not logged in → go home
    } else if (session.user.role !== "admin") {
      router.replace("/"); // logged in but not admin
    }
  }, [session, status, router]);

  if (status === "loading") return <p>Loading...</p>;

  // prevent flash while redirecting
  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  );
}
