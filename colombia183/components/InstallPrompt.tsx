"use client";
import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa-dismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const android = /android/i.test(navigator.userAgent);
    setIsIOS(ios);
    setIsAndroid(android);

    if (ios) {
      setShowBanner(true);
      return;
    }

    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    });

    // Show for all browsers on desktop too
    if (!ios && !android) setShowBanner(true);
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
      padding: "16px",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/183logo.png" alt="183 Days" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#e8e4d9" }}>Install 183 Days</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Add to your home screen</div>
          </div>
        </div>
        <button onClick={handleDismiss} style={{ background: "transparent", border: "none", color: "#6b7280", fontSize: 18, cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {/* Android */}
        <div style={{
          flex: 1, background: "#0f1117", borderRadius: 10, padding: "12px",
          border: isAndroid ? "1px solid #FCD11633" : "1px solid #2a2d3e",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: "inline-block" }}>
              <path d="M17.523 15.341L21 12l-3.477-3.341" stroke="#3DDC84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12h18" stroke="#3DDC84" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6.5 5.5L3 12l3.5 6.5" stroke="#3DDC84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 5.5L21 12l-3.5 6.5" stroke="#3DDC84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#3DDC84", marginBottom: 4 }}>Android</div>
          {deferredPrompt ? (
            <button onClick={handleInstall} style={{ background: "#3DDC84", color: "#16192a", border: "none", borderRadius: 8, padding: "6px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%" }}>
              Install App
            </button>
          ) : (
            <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>
              Tap <strong style={{ color: "#9ca3af" }}>⋮ Menu</strong> → <strong style={{ color: "#9ca3af" }}>Add to Home Screen</strong>
            </div>
          )}
        </div>

        {/* iOS */}
        <div style={{
          flex: 1, background: "#0f1117", borderRadius: 10, padding: "12px",
          border: isIOS ? "1px solid #FCD11633" : "1px solid #2a2d3e",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: "inline-block" }}>
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#555"/>
              <path d="M15.5 8.5c0 1.933-1.567 3.5-3.5 3.5S8.5 10.433 8.5 8.5 10.067 5 12 5s3.5 1.567 3.5 3.5z" fill="#fff"/>
              <path d="M5 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 4 }}>iPhone / iPad</div>
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>
            Tap <strong style={{ color: "#9ca3af" }}>Share ⬆</strong> → <strong style={{ color: "#9ca3af" }}>Add to Home Screen</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
