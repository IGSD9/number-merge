"use client";

import { useEffect } from "react";
import { syncPendingScore } from "@/lib/offline/syncScore";

export function ServiceWorkerRegister() {
  useEffect(() => {
    const handleOnline = () => {
      void syncPendingScore();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
