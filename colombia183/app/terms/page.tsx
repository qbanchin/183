export default function TermsPage() {
  const lastUpdated = "June 27, 2026";

  return (
    <main style={{ minHeight: "100dvh", background: "#0f1117", color: "#e8e4d9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: "#16192a", borderBottom: "1px solid #2a2d3e", padding: "0 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", height: 58 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ fontSize: 20 }}>🇨🇴</span>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>183 Days</span>
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 48 }}>Last updated: {lastUpdated}</p>

        <Section title="1. Acceptance of Terms">
          By accessing or using 183 Days ("the app"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
        </Section>

        <Section title="2. Description of Service">
          183 Days is an informational tracking tool that helps users monitor the number of days they have spent in Colombia within a rolling 365-day period, in relation to Colombia's tax residency threshold of 183 days.
        </Section>

        <Section title="3. Not Legal or Tax Advice">
          183 Days is an informational tool only. Nothing in this app constitutes legal, tax, financial, or professional advice. The calculations provided are estimates based on the dates you enter and should not be relied upon as definitive determinations of your tax residency status.
          <br /><br />
          You should always consult a qualified Colombian tax professional or attorney for advice specific to your situation.
        </Section>

        <Section title="4. User Responsibilities">
          You are responsible for:
          <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
            <li>The accuracy of the travel dates you enter</li>
            <li>Keeping your account credentials secure</li>
            <li>Complying with all applicable laws and regulations</li>
            <li>Any decisions made based on information from this app</li>
          </ul>
        </Section>

        <Section title="5. Gmail Access">
          If you choose to connect your Gmail account, you grant 183 Days read-only access to search for Colombia travel booking emails. You may revoke this access at any time through your Google Account settings at{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: "#FCD116" }}>myaccount.google.com/permissions</a>.
        </Section>

        <Section title="6. Limitation of Liability">
          183 Days and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the app, including but not limited to tax penalties, legal fees, or financial losses resulting from reliance on the app's calculations.
        </Section>

        <Section title="7. Changes to Terms">
          We reserve the right to modify these Terms at any time. Continued use of the app after changes constitutes acceptance of the updated Terms.
        </Section>

        <Section title="8. Contact">
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:admin@183days.co" style={{ color: "#FCD116" }}>admin@183days.co</a>.
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#FCD116", marginBottom: 12 }}>{title}</h2>
      <div style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}
