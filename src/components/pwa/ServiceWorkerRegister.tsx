"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function ServiceWorkerRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("SW register failed", err));

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const dismissed = localStorage.getItem("zyra-pwa-dismissed");
    if (dismissed === "1") setShowInstall(false);

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setShowInstall(false);
    setDeferred(null);
  }

  function dismiss() {
    setShowInstall(false);
    localStorage.setItem("zyra-pwa-dismissed", "1");
  }

  if (!showInstall || !deferred) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-lg px-4 md:bottom-6">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Install Zyra</p>
          <p className="text-xs text-muted-foreground">
            Add to home screen for quick Market & Donation access.
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={dismiss}>
          Not now
        </Button>
        <Button size="sm" onClick={install}>
          Install
        </Button>
      </div>
    </div>
  );
}
