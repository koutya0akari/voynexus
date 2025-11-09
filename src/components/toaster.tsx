"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: number;
  message: string;
};

let toastId = 0;
const listeners = new Set<(toast: Toast) => void>();

export const toast = (message: string) => {
  const next: Toast = { id: ++toastId, message };
  listeners.forEach((listener) => listener(next));
};

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (item: Toast) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((toast) => toast.id !== item.id));
      }, 4000);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-md bg-neutral text-white px-4 py-2 shadow-lg">
          {item.message}
        </div>
      ))}
    </div>
  );
}
