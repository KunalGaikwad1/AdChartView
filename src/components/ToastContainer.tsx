"use client";

import { useToast } from "@/hooks/use-toast";

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-gray-800 text-white px-4 py-2 rounded shadow-md"
        >
          {t.title && <div className="font-bold">{t.title}</div>}
          {t.description && <div>{t.description}</div>}
          {t.action && <div>{t.action}</div>}
          <button
            className="ml-auto mt-2 text-sm underline"
            onClick={() => dismiss(t.id)}
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}
