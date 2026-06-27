"use client";
import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa-dismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const android = /android/i.test(navigator.userAgent);
    setIsIOS(ios);
    setIsAndroid(android);
    setShowBanner(true);

    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  function handleAndroidInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setShowBanner(false);
        setDeferredPrompt(null);
      });
    } else {
      // Fallback instructions
      alert("To install: tap the browser menu (⋮) and select 'Add to Home Screen'");
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", "1");
  }

  if (!showBanner || dismissed) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em" }}>
          INSTALL THE APP
        </div>
        <button onClick={handleDismiss} style={{ background: "transparent", border: "none", color: "#4b5563", fontSize: 16, cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        {/* Android button */}
        <button
          onClick={handleAndroidInstall}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block", width: "100%" }}
        >
          <img
            src="/install-button-android.png"
            alt="Install for Android Device"
            style={{ width: 192, height: "auto", borderRadius: 8, display: "block" }}
          />
        </button>

        {/* iOS button */}
        <button
          onClick={() => setShowIOSInstructions(!showIOSInstructions)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block", width: "100%" }}
        >
          <img
            src="/install-button-apple.png"
            alt="Install for Apple Device"
            style={{ width: 192, height: "auto", borderRadius: 8, display: "block" }}
          />
        </button>

        {/* iOS instructions dropdown */}
        {showIOSInstructions && (
          <div style={{ background: "#16192a", border: "1px solid #2a2d3e", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#9ca3af", lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, color: "#e8e4d9", marginBottom: 8 }}>To install on iPhone or iPad:</div>
            <div>1. Open <strong style={{ color: "#FCD116" }}>183days.co</strong> in Safari</div>
            <div>2. Tap the <strong style={{ color: "#FCD116" }}>Share</strong> button ⬆ at the bottom</div>
            <div>3. Scroll down and tap <strong style={{ color: "#FCD116" }}>Add to Home Screen</strong></div>
            <div>4. Tap <strong style={{ color: "#FCD116" }}>Add</strong> — done!</div>
          </div>
        )}
      </div>
    </div>
  );
}
