import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  const { data: gmailToken } = await supabase
    .from("gmail_tokens")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return (
    <DashboardClient
      initialTrips={trips ?? []}
      userEmail={user.email ?? ""}
      gmailConnected={!!gmailToken}
    />
  );
}
