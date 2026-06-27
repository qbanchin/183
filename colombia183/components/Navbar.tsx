"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function Navbar({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav style={{
      background: "#16192a",
      borderBottom: "1px solid #2a2d3e",
      padding: "0 20px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🇨🇴</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.2px" }}>183</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/history", label: "History" },
          ].map(n => (
            <Link key={n.href} href={n.href} style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: pathname === n.href ? "#FCD116" : "transparent",
              color: pathname === n.href ? "#16192a" : "#9ca3af",
              transition: "all .15s",
            }}>
              {n.label}
            </Link>
          ))}

          <a href="https://www.paypal.com/donate/?business=admin%40183days.co&currency_code=USD" target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "#003087", color: "#fff", border: "none", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>☕ Donate</a>         <button
            onClick={handleLogout}
            style={{ marginLeft: 8, padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "transparent", border: "1px solid #2a2d3e", color: "#6b7280" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
