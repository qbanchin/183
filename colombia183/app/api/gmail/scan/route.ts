import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getValidAccessToken(userId: string, supabase: any): Promise<string | null> {
  const { data } = await supabase
    .from("gmail_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) return null;

  const isExpired = data.expires_at && new Date(data.expires_at) < new Date(Date.now() + 60000);

  if (isExpired && data.refresh_token) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: data.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const refreshed = await res.json();
    if (refreshed.access_token) {
      await supabase.from("gmail_tokens").update({
        access_token: refreshed.access_token,
        expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      }).eq("user_id", userId);
      return refreshed.access_token;
    }
    return null;
  }

  return data.access_token;
}

async function fetchEmailBody(messageId: string, accessToken: string): Promise<string> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const msg = await res.json();

  function extractText(payload: any): string {
    if (!payload) return "";
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }
    if (payload.parts) {
      return payload.parts.map((p: any) => extractText(p)).join("\n");
    }
    return "";
  }

  const subject = msg.payload?.headers?.find((h: any) => h.name === "Subject")?.value ?? "";
  const body = extractText(msg.payload);
  return `Subject: ${subject}\n\n${body}`.slice(0, 8000);
}

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = await getValidAccessToken(user.id, supabase);
  if (!accessToken) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  const queries = [
    "Colombia booking confirmation",
    "Bogotá reservation",
    "Medellín reservation",
    "Cartagena reservation",
    "BOG flight confirmation",
    "Airbnb Colombia",
    "Colombia hotel confirmation",
  ];

  const messageIds = new Set<string>();

  for (const q of queries) {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=10`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    if (data.messages) {
      data.messages.forEach((m: any) => messageIds.add(m.id));
    }
  }

  if (messageIds.size === 0) {
    return NextResponse.json({ trips: [], scanned: 0, message: "No Colombia booking emails found." });
  }

  const ids = Array.from(messageIds).slice(0, 20);
  const emailTexts: string[] = [];

  for (const id of ids) {
    try {
      const text = await fetchEmailBody(id, accessToken);
      if (text.trim()) emailTexts.push(text);
    } catch {}
  }

  const combined = emailTexts.map((t, i) => `--- EMAIL ${i + 1} ---\n${t}`).join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: `Extract ALL Colombia stays from these booking emails — flights, hotels, Airbnb, rentals.

Colombia cities: Bogotá, Medellín, Cali, Cartagena, Barranquilla, Santa Marta, and anywhere else in Colombia.
Colombia airports: BOG, MDE, CLO, CTG, BAQ, SMR, PEI, BGA, ADZ, CUC.

RULES:
- Flight TO Colombia one-way: start_date = end_date = arrival date
- Flight FROM Colombia one-way: start_date = end_date = departure date
- Round trip: start_date = Colombia arrival, end_date = Colombia departure
- Hotel/Airbnb/rental: start_date = check-in, end_date = check-out
- Same trip in multiple emails = ONE entry with earliest arrival and latest departure
- location is always "colombia"
- note: brief description like "Airbnb Medellín", "Flight MIA→BOG", "Hotel Cartagena"

Return ONLY a JSON array:
[{"start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD","location":"colombia","note":"..."}]

If nothing found: []

EMAILS:
${combined}`,
    }],
  });

  const text = message.content.find(b => b.type === "text")?.text ?? "[]";
  let trips: any[] = [];
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    trips = JSON.parse(cleaned);
    if (!Array.isArray(trips)) trips = [];
  } catch { trips = []; }

  const valid = trips.filter((t: any) =>
    t.start_date && t.end_date && t.location === "colombia" &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.start_date) &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.end_date)
  );

  return NextResponse.json({
    trips: valid,
    scanned: emailTexts.length,
    message: `Scanned ${emailTexts.length} emails, found ${valid.length} Colombia stay${valid.length !== 1 ? "s" : ""}.`,
  });
}