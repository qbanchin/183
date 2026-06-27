import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "183 — Colombia Tax Day Tracker",
  description: "Track your days in Colombia to stay ahead of the 183-day tax residency rule.",
  metadataBase: new URL("https://colombia183.com"),
  openGraph: {
    title: "183 — Colombia Tax Day Tracker",
    description: "Know exactly where you stand on Colombian tax residency.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
