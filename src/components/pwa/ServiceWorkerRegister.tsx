"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PWA_BIP_EVENT,
  PWA_SHOW_EVENT,
  clearDismissed,
  ensureInstallListeners,
  getDeferredPrompt,
  isDismissed,
  isIos,
  isStandalone,
  promptInstall,
  registerServiceWorker,
  setDismissed,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";

/**
 * Registers the service worker and shows an install affordance.
 * - Chromium: uses beforeinstallprompt when the browser fires it
 * - iOS Safari: shows Share → Add to Home Screen instructions (BIP never fires)
 * - Fallback: manual tip if BIP is delayed / blocked
 *
 * SW registration always runs (even if the tip was dismissed).
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

    // Capture BIP as early as possible (even if tip is dismissed)
    ensureInstallListeners();

    let cancelled = false;

    registerServiceWorker().then((ok) => {
      if (!cancelled && ok) setSwReady(true);
    });

    // If BIP already fired before mount, pick it up
    const existing = getDeferredPrompt();
    if (existing) {
      setDeferred(existing);
      setMode("chromium");
    }

    const onBip = () => {
      const next = getDeferredPrompt();
      if (!next) return;
      setDeferred(next);
      setMode("chromium");
    };
    window.addEventListener(PWA_BIP_EVENT, onBip);

    const onInstalled = () => setMode("hidden");
    window.addEventListener("appinstalled", onInstalled);

    const onForceShow = () => {
      clearDismissed();
      setMode((current) => {
        if (current === "chromium") return current;
        if (getDeferredPrompt()) return "chromium";
        if (isIos()) return "ios";
        return "tip";
      });
    };
    window.addEventListener(PWA_SHOW_EVENT, onForceShow);

    // Show tip unless recently dismissed — don't wait on BIP (often delayed)
    const tipTimer = window.setTimeout(() => {
      if (cancelled) return;
      if (isDismissed()) return;
      setMode((current) => {
        if (current === "chromium") return current;
        if (isIos()) return "ios";
        return current === "hidden" ? "tip" : current;
      });
    }, 800);

    return () => {
      cancelled = true;
      window.clearTimeout(tipTimer);
      window.removeEventListener(PWA_BIP_EVENT, onBip);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener(PWA_SHOW_EVENT, onForceShow);
    };
  }, []);

  useEffect(() => {
    if (deferred) setMode("chromium");
  }, [deferred]);

  async function install() {
    const outcome = await promptInstall();
    if (outcome === "accepted") setMode("hidden");
    if (outcome !== "unavailable") setDeferred(null);
  }

  function dismiss() {
    setMode("hidden");
    setDismissed();
  }

  if (mode === "hidden") return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-6">
      <div className="pointer-events-auto w-full max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-lg ring-1 ring-black/5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Install Zyra</p>
              {mode === "ios" ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Tap{" "}
                  <span className="font-medium text-foreground">Share</span> then{" "}
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
                  <strong>Add to Home screen</strong>. On iPhone: Safari → Share
                  → Add to Home Screen.
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
    </div>
  );
}
