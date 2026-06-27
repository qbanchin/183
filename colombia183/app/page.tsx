import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2d3e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🇨🇴</span>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.3px" }}>183</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" style={{ color: "#9ca3af", fontWeight: 600, fontSize: 14, padding: "8px 16px" }}>Log in</Link>
          <Link href="/signup" style={{ background: "#FCD116", color: "#16192a", fontWeight: 700, fontSize: 14, padding: "8px 20px", borderRadius: 8 }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#FCD116", letterSpacing: "0.1em", marginBottom: 24 }}>
          COLOMBIA TAX RESIDENCY TRACKER
        </div>

        <h1 style={{ fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24, maxWidth: 700 }}>
          Know your{" "}
          <span style={{ color: "#FCD116" }}>183 days</span>
          {" "}before they sneak up.
        </h1>

        <p style={{ fontSize: 18, color: "#9ca3af", maxWidth: 500, lineHeight: 1.7, marginBottom: 48 }}>
          The rolling 365-day rule catches expats off guard every year. 183 tracks every day you spend in the country — automatically from flight emails or manually — and alerts you before you cross the threshold.
        </p>

        <Link href="/signup" style={{ background: "#FCD116", color: "#16192a", fontWeight: 800, fontSize: 17, padding: "16px 40px", borderRadius: 12, display: "inline-block" }}>
          Start tracking free →
        </Link>

        <p style={{ marginTop: 16, fontSize: 13, color: "#4b5563" }}>No credit card. Free forever for personal use.</p>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 24px", background: "#16192a", borderTop: "1px solid #2a2d3e" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#FCD116", letterSpacing: "0.1em", marginBottom: 40, textAlign: "center" }}>HOW IT WORKS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
            {[
              { icon: "✉️", title: "Paste a flight email", body: "AI reads your booking confirmation and extracts your Colombia travel dates automatically." },
              { icon: "📅", title: "Or enter manually", body: "Add any stay — arrivals, departures, multi-city trips — in seconds with the date picker." },
              { icon: "📊", title: "See your rolling count", body: "The gauge tracks your worst 365-day window in real time, exactly how Colombian tax law calculates it." },
              { icon: "⚠️", title: "Get warned early", body: "At 150 days you'll see a warning. At 183 you'll know to call your accountant." },
            ].map(f => (
              <div key={f.title}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer style={{ padding: "24px", borderTop: "1px solid #2a2d3e", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 12 }}>
          <a href="/privacy" style={{ fontSize: 12, color: "#6b7280", textDecoration: "none" }}>Privacy Policy</a>
          <a href="/terms" style={{ fontSize: 12, color: "#6b7280", textDecoration: "none" }}>Terms of Service</a>
          <a href="mailto:admin@183days.co" style={{ fontSize: 12, color: "#6b7280", textDecoration: "none" }}>Contact</a>
        </div>
        <p style={{ fontSize: 12, color: "#374151", maxWidth: 600, margin: "0 auto" }}>
          183 is an informational tool only. It does not provide legal or tax advice. Consult a Colombian tax professional for your specific situation.
        </p>
      </footer>
    </main>
  );
}
