"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Registers the service worker and shows an install affordance.
 * - Chromium: uses beforeinstallprompt when the browser fires it
 * - iOS Safari: shows Share → Add to Home Screen instructions (BIP never fires)
 * - Fallback: manual tip if BIP is delayed / blocked
 */
export function ServiceWorkerRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [mode, setMode] = useState<"hidden" | "chromium" | "ios" | "tip">(
    "hidden",
  );
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    const dismissed = localStorage.getItem("zyra-pwa-dismissed");
    // Allow re-show after 3 days
    if (dismissed) {
      const ts = Number(dismissed);
      if (Number.isFinite(ts) && Date.now() - ts < 3 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    let cancelled = false;

    async function registerSw() {
      if (!("serviceWorker" in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        await navigator.serviceWorker.ready;
        if (!cancelled) setSwReady(true);
        // Nudge update
        reg.update().catch(() => {});
      } catch (err) {
        console.warn("[zyra] SW register failed", err);
      }
    }

    registerSw();

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode("chromium");
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const onInstalled = () => setMode("hidden");
    window.addEventListener("appinstalled", onInstalled);

    // iOS never gets beforeinstallprompt — show instructions after a beat
    const tipTimer = window.setTimeout(() => {
      if (cancelled) return;
      setMode((current) => {
        if (current === "chromium") return current;
        if (isIos()) return "ios";
        // Desktop Chrome often delays BIP; show tip until BIP arrives
        return current === "hidden" ? "tip" : current;
      });
    }, 2500);

    return () => {
      cancelled = true;
      window.clearTimeout(tipTimer);
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // When BIP arrives after tip, upgrade to chromium button
  useEffect(() => {
    if (deferred) setMode("chromium");
  }, [deferred]);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setMode("hidden");
    setDeferred(null);
  }

  function dismiss() {
    setMode("hidden");
    localStorage.setItem("zyra-pwa-dismissed", String(Date.now()));
  }

  if (mode === "hidden") return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-lg px-4 md:bottom-6">
      <div className="rounded-2xl border border-border bg-card p-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Install Zyra</p>
            {mode === "ios" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Tap <span className="font-medium text-foreground">Share</span>{" "}
                then{" "}
                <span className="font-medium text-foreground">
                  Add to Home Screen
                </span>
                . Works in Safari.
              </p>
            ) : mode === "chromium" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Add to your home screen for faster Market & Donation access.
                {swReady ? "" : " Preparing…"}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                On Chrome: menu (⋮) → <strong>Install app</strong> /{" "}
                <strong>Add to Home screen</strong>. On iPhone: Safari → Share →
                Add to Home Screen.
              </p>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            Not now
          </Button>
          {mode === "chromium" ? (
            <Button size="sm" onClick={install} disabled={!deferred}>
              Install
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
