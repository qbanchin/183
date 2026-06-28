"use client";
import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    if (localStorage.getItem("pwa-dismissed")) {
      setDismissed(true);
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    setShowBanner(true);

    // Listen for Chrome/Android install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleAndroidInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback — direct to instructions
      alert("To install:\n1. Tap the browser menu (⋮) in Chrome\n2. Tap 'Add to Home Screen'\n3. Tap 'Install'");
    }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", "1");
  }

  if (isInstalled) return (
    <div style={{ fontSize: 12, color: "#6ee7b7", textAlign: "center", padding: "8px", marginBottom: 8 }}>
      ✅ App installed on your device
    </div>
  );

  if (dismissed) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 6 }}>
        <button onClick={handleDismiss} style={{ background: "transparent", border: "none", color: "#4b5563", fontSize: 14, cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        {/* Android */}
        <button
          onClick={handleAndroidInstall}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <img
            src="/install-button-android.png"
            alt="Install for Android"
            style={{ width: 192, height: "auto", borderRadius: 8, display: "block" }}
          />
        </button>

        {/* iOS */}
        <button
          onClick={() => setShowIOSInstructions(!showIOSInstructions)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <img
            src="/install-button-apple.png"
            alt="Install for Apple"
            style={{ width: 192, height: "auto", borderRadius: 8, display: "block" }}
          />
        </button>
      </div>

      {/* iOS instructions */}
      {showIOSInstructions && (
        <div style={{ background: "#16192a", border: "1px solid #2a2d3e", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#9ca3af", lineHeight: 1.8, marginTop: 12, textAlign: "left" }}>
          <div style={{ fontWeight: 700, color: "#e8e4d9", marginBottom: 8 }}>To install on iPhone or iPad:</div>
          <div>1. Open <strong style={{ color: "#FCD116" }}>183days.co</strong> in Safari</div>
          <div>2. Tap the <strong style={{ color: "#FCD116" }}>Share</strong> button ⬆ at the bottom</div>
          <div>3. Scroll down and tap <strong style={{ color: "#FCD116" }}>Add to Home Screen</strong></div>
          <div>4. Tap <strong style={{ color: "#FCD116" }}>Add</strong> — done!</div>
        </div>
      )}
    </div>
  );
}
