"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export const useRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        // You already store role in session from NextAuth
        setIsAdmin(user.role === "admin");
      } catch (err) {
        console.error("Role check error:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { isAdmin, loading: loading || authLoading };
};
