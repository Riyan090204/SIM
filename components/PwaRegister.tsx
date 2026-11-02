"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  useEffect(() => {
    // 1. Registrasi Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });
    }

    if (isStandalone) return;

    // 2. Tangkap event prompt installasi PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Tampilkan banner install jika user belum dismiss dalam session ini
      const dismissed = sessionStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
  };

  if (isStandalone || !showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <aside 
      aria-label="Install Aplikasi"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 no-print"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shrink-0 shadow-md">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">Install PangandaranHub</p>
          <p className="text-xs text-slate-300 truncate">Akses cepat seperti aplikasi di HP/PC</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

