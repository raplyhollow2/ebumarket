/**
 * Shared PWA install state — captures beforeinstallprompt early and lets
 * any UI (banner, profile) trigger install without a page reload.
 */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __zyraDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

const DISMISS_KEY = "zyra-pwa-dismissed";
const DISMISS_MS = 3 * 24 * 60 * 60 * 1000;
export const PWA_SHOW_EVENT = "zyra:pwa-show-install";
export const PWA_BIP_EVENT = "zyra:pwa-bip";

/** Inline boot script — must run before React so BIP is not lost. */
export const PWA_BOOT_SCRIPT = `(function(){try{window.__zyraDeferredPrompt=null;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__zyraDeferredPrompt=e;window.dispatchEvent(new Event("${PWA_BIP_EVENT}"));});window.addEventListener("appinstalled",function(){window.__zyraDeferredPrompt=null;});}catch(_){}})();`;

let deferred: BeforeInstallPromptEvent | null = null;
let listening = false;

function syncDeferredFromWindow() {
  if (typeof window === "undefined") return;
  if (window.__zyraDeferredPrompt) {
    deferred = window.__zyraDeferredPrompt;
  }
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isDismissed(): boolean {
  if (typeof localStorage === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < DISMISS_MS;
}

export function setDismissed() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

export function clearDismissed() {
  localStorage.removeItem(DISMISS_KEY);
}

export function getDeferredPrompt() {
  syncDeferredFromWindow();
  return deferred;
}

export function requestShowInstallBanner() {
  if (typeof window === "undefined") return;
  clearDismissed();
  window.dispatchEvent(new CustomEvent(PWA_SHOW_EVENT));
}

/** Call once from the client root — safe to call multiple times. */
export function ensureInstallListeners() {
  if (typeof window === "undefined" || listening) return;
  listening = true;
  syncDeferredFromWindow();

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    window.__zyraDeferredPrompt = deferred;
    window.dispatchEvent(
      new CustomEvent(PWA_BIP_EVENT, { detail: deferred }),
    );
  });

  window.addEventListener("appinstalled", () => {
    deferred = null;
    window.__zyraDeferredPrompt = null;
  });

  // Boot script already captured BIP — notify React subscribers
  if (deferred) {
    window.dispatchEvent(
      new CustomEvent(PWA_BIP_EVENT, { detail: deferred }),
    );
  }
}

export async function promptInstall(): Promise<
  "accepted" | "dismissed" | "unavailable"
> {
  syncDeferredFromWindow();
  const event = deferred;
  if (!event) return "unavailable";
  await event.prompt();
  const { outcome } = await event.userChoice;
  deferred = null;
  window.__zyraDeferredPrompt = null;
  return outcome;
}

export async function registerServiceWorker(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    await navigator.serviceWorker.ready;
    reg.update().catch(() => {});
    return true;
  } catch (err) {
    console.warn("[zyra] SW register failed", err);
    return false;
  }
}
