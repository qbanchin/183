"use client";
import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa-dismissed")) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    if (ios) {
      setShowBanner(true);
      return;
    }

    // Android/Chrome install prompt
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    });
  }, []);

  function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setShowBanner(false);
        setDeferredPrompt(null);
      });
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", "1");
  }

  if (!showBanner || dismissed) return null;

  return (
    <div style={{
      background: "#16192a",
      border: "1px solid #FCD11633",
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      <img src="/183logo.png" alt="183 Days" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#e8e4d9", marginBottom: 2 }}>
          Install 183 Days
        </div>
        {isIOS ? (
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
            Tap <strong style={{ color: "#9ca3af" }}>Share</strong> then <strong style={{ color: "#9ca3af" }}>Add to Home Screen</strong> to install
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Add to your home screen for quick access
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {!isIOS && (
          <button
            onClick={handleInstall}
            style={{ background: "#FCD116", color: "#16192a", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{ background: "transparent", border: "1px solid #2a2d3e", color: "#6b7280", borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
