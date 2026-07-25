"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PWA_BIP_EVENT,
  ensureInstallListeners,
  getDeferredPrompt,
  isIos,
  isStandalone,
  promptInstall,
  requestShowInstallBanner,
} from "@/lib/pwa-install";

export function InstallPwaCard() {
  const [standalone, setStandalone] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    ensureInstallListeners();
    setStandalone(isStandalone());
    setIos(isIos());
    setCanPrompt(Boolean(getDeferredPrompt()));

    const onBip = () => setCanPrompt(Boolean(getDeferredPrompt()));
    const onInstalled = () => {
      setStandalone(true);
      setCanPrompt(false);
    };
    window.addEventListener(PWA_BIP_EVENT, onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener(PWA_BIP_EVENT, onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone) {
    return (
      <div className="rounded-2xl bg-card p-4 ring-1 ring-border/60">
        <p className="text-sm font-medium">Zyra is installed</p>
        <p className="mt-1 text-xs text-muted-foreground">
          You&apos;re using the home-screen app.
        </p>
      </div>
    );
  }

  async function onInstall() {
    const outcome = await promptInstall();
    if (outcome === "accepted") {
      toast.success("Zyra installed");
      setStandalone(true);
      return;
    }
    if (outcome === "dismissed") {
      toast.message("Install cancelled");
      return;
    }
    // BIP not available — show tip + browser instructions
    requestShowInstallBanner();
    if (ios) {
      toast.message("Safari → Share → Add to Home Screen");
    } else {
      toast.message("Chrome menu (⋮) → Install app");
    }
  }

  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border/60">
      <p className="text-sm font-medium">Install Zyra app</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {ios
          ? "Safari: Share → Add to Home Screen."
          : canPrompt
            ? "One tap installs Zyra on this device."
            : "If Install is greyed in the browser, use Chrome ⋮ → Install app, or show the tip below."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={onInstall}>
          {canPrompt ? "Install" : ios ? "Show how" : "Install / Show tip"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            requestShowInstallBanner();
            toast.message("Install tip shown at the bottom");
          }}
        >
          Show tip
        </Button>
      </div>
    </div>
  );
}
