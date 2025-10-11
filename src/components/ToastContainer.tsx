"use client";

import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 w-[min(92vw,380px)]">
      {toasts.map((t) => {
        const variant = t.variant ?? "default";
        const Icon =
          variant === "success"
            ? CheckCircle2
            : variant === "destructive"
            ? XCircle
            : variant === "warning"
            ? TriangleAlert
            : Info;

        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={cn(
              "relative border rounded-lg shadow-sm p-3 sm:p-4 bg-card text-card-foreground toast-enter",
              t.open === false && "toast-exit",
              variant === "success" && "border-green-500/30",
              variant === "destructive" && "border-destructive/40",
              variant === "warning" && "border-yellow-500/30",
              variant === "info" && "border-blue-500/30"
            )}
            style={{ ['--toast-duration' as unknown as keyof React.CSSProperties]: `${t.duration ?? 5000}ms` } as React.CSSProperties}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "mt-0.5 rounded-full p-1",
                variant === "success" && "text-green-500",
                variant === "destructive" && "text-destructive",
                variant === "warning" && "text-yellow-600",
                variant === "info" && "text-blue-600"
              )}>
                {t.icon ? t.icon : <Icon className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                {t.title && <div className="font-semibold text-sm sm:text-base">{t.title}</div>}
                {t.description && (
                  <div className="text-sm text-muted-foreground mt-0.5">{t.description}</div>
                )}
                {t.action && <div className="mt-2">{t.action}</div>}
              </div>
              <button
                aria-label="Close"
                type="button"
                className="p-1 rounded-md hover:bg-accent text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(t.id);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="toast-progress" />
          </div>
        );
      })}
    </div>
  );
}
