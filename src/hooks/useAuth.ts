"use client";

import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const user = session?.user ?? null;
  const loading = status === "loading";

  return { user, session, loading };
};
