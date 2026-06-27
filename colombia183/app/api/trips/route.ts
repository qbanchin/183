import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trips: data });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { location, start_date, end_date, note } = body;

  if (!location || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (new Date(start_date) > new Date(end_date)) {
    return NextResponse.json({ error: "start_date must be before end_date" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("trips")
    .insert({ user_id: user.id, location, start_date, end_date, note: note || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trip: data }, { status: 201 });
}
