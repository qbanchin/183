export default function PrivacyPage() {
  const lastUpdated = "June 27, 2026";

  return (
    <main style={{ minHeight: "100dvh", background: "#0f1117", color: "#e8e4d9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: "#16192a", borderBottom: "1px solid #2a2d3e", padding: "0 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", height: 58, gap: 10 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ fontSize: 20 }}>🇨🇴</span>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>183 Days</span>
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 48 }}>Last updated: {lastUpdated}</p>

        <Section title="1. Overview">
          183 Days ("we", "our", or "the app") is a web application that helps individuals track their days spent in Colombia to monitor compliance with Colombia's 183-day tax residency rule. This Privacy Policy explains how we collect, use, and protect your personal information.
        </Section>

        <Section title="2. Information We Collect">
          <strong style={{ color: "#e8e4d9" }}>Account Information</strong><br />
          When you create an account, we collect your email address and a securely hashed password, managed through Supabase, our authentication provider.
          <br /><br />
          <strong style={{ color: "#e8e4d9" }}>Travel Data</strong><br />
          We store the travel dates you enter or confirm — specifically arrival and departure dates for stays in Colombia, along with optional notes. We do not collect passport information, location data, or any other personal travel documents.
          <br /><br />
          <strong style={{ color: "#e8e4d9" }}>Gmail Data (Optional)</strong><br />
          If you choose to connect your Gmail account, we request read-only access solely to search for Colombia-related booking confirmation emails (flights, hotels, short-term rentals). We use this access to extract travel dates only.
          <br /><br />
          We <strong style={{ color: "#FCD116" }}>do not</strong>:
          <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
            <li>Store the content of your emails</li>
            <li>Read emails unrelated to Colombia travel bookings</li>
            <li>Share your email content with any third party</li>
            <li>Use your email data for advertising or profiling</li>
          </ul>
          We only store the extracted travel dates and booking source (e.g. "Airbnb Medellín") that you explicitly confirm before they are added to your tracker.
        </Section>

        <Section title="3. How We Use Your Information">
          We use your information solely to:
          <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
            <li>Provide and operate the 183 Days tracking service</li>
            <li>Calculate your rolling 365-day Colombia day count</li>
            <li>Display your stay history and projected counts</li>
            <li>Send account-related emails (e.g. email confirmation on signup)</li>
          </ul>
          We do not sell, rent, or share your personal data with third parties for marketing purposes.
        </Section>

        <Section title="4. Gmail API Usage">
          183 Days uses the Gmail API to help you automatically import Colombia travel dates from booking confirmation emails. Our use of Gmail data complies with the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{ color: "#FCD116" }}>
            Google API Services User Data Policy
          </a>, including the Limited Use requirements.
          <br /><br />Specifically:
          <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
            <li>We only request <strong style={{ color: "#e8e4d9" }}>read-only</strong> access to your Gmail</li>
            <li>We search only for emails related to Colombia travel bookings</li>
            <li>We extract only travel dates from matching emails</li>
            <li>We never store raw email content on our servers</li>
            <li>You must review and confirm all extracted trips before they are saved</li>
            <li>You can disconnect Gmail access at any time by contacting us</li>
          </ul>
          Your Gmail OAuth tokens are stored securely and used only to perform searches on your behalf when you click "Scan Gmail."
        </Section>

        <Section title="5. Data Storage and Security">
          Your data is stored securely using Supabase, hosted on AWS infrastructure. We use Row Level Security (RLS) to ensure each user can only access their own data. All data is transmitted over HTTPS.
          <br /><br />
          We retain your travel data for as long as your account is active. You may delete individual stays at any time from the app, or delete your entire account by contacting us at{" "}
          <a href="mailto:admin@183days.co" style={{ color: "#FCD116" }}>admin@183days.co</a>.
        </Section>

        <Section title="6. Third-Party Services">
          We use the following third-party services to operate 183 Days:
          <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
            <li><strong style={{ color: "#e8e4d9" }}>Supabase</strong> — database and authentication</li>
            <li><strong style={{ color: "#e8e4d9" }}>Vercel</strong> — hosting and deployment</li>
            <li><strong style={{ color: "#e8e4d9" }}>Anthropic (Claude)</strong> — AI extraction of travel dates from email text</li>
            <li><strong style={{ color: "#e8e4d9" }}>Google Gmail API</strong> — optional inbox scanning</li>
          </ul>
          Each of these services has their own privacy policies and security practices.
        </Section>

        <Section title="7. Your Rights">
          You have the right to:
          <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and all associated data</li>
            <li>Disconnect Gmail access at any time</li>
            <li>Export your travel data</li>
          </ul>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:admin@183days.co" style={{ color: "#FCD116" }}>admin@183days.co</a>.
        </Section>

        <Section title="8. Cookies">
          We use essential cookies only — specifically session cookies required to keep you logged in. We do not use tracking cookies or advertising cookies.
        </Section>

        <Section title="9. Children's Privacy">
          183 Days is not directed at children under the age of 13. We do not knowingly collect personal information from children.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Continued use of the app after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="11. Contact Us">
          If you have any questions about this Privacy Policy, please contact us at:
          <br /><br />
          <strong style={{ color: "#e8e4d9" }}>183 Days</strong><br />
          <a href="mailto:admin@183days.co" style={{ color: "#FCD116" }}>admin@183days.co</a><br />
          <a href="https://183days.co" style={{ color: "#FCD116" }}>https://183days.co</a>
        </Section>

        <div style={{ marginTop: 48, padding: "16px 20px", background: "#16192a", borderRadius: 12, border: "1px solid #2a2d3e", fontSize: 13, color: "#4b5563", lineHeight: 1.7 }}>
          <strong style={{ color: "#FCD116" }}>⚖️ Disclaimer:</strong> 183 Days is an informational tool only and does not provide legal or tax advice. The 183-day threshold is defined in Article 10 of Colombia's Tax Code (Estatuto Tributario). Consult a qualified Colombian tax professional for advice specific to your situation.
        </div>
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
