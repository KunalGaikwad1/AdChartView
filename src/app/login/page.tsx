"use client";

import LoginPageContent from "@/components/LoginPageContent";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-400">
          Loading...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
