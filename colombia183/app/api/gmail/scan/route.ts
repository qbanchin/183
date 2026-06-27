import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// All search queries to find Colombia booking emails
const SEARCH_QUERIES = [
  // Airport codes
  "BOG flight confirmation",
  "MDE flight confirmation", 
  "CLO flight confirmation",
  "CTG flight confirmation",
  "BAQ flight confirmation",
  "SMR flight confirmation",
  "PEI flight confirmation",
  "BGA flight confirmation",
  "ADZ flight confirmation",
  // Airlines that fly to Colombia
  "Avianca confirmation",
  "Avianca itinerary",
  "LATAM confirmation",
  "LATAM itinerary",
  "Copa Airlines confirmation",
  "Copa Airlines itinerary",
  "Wingo confirmation",
  "EasyFly confirmation",
  "Satena confirmation",
  "American Airlines BOG",
  "American Airlines MDE",
  "American Airlines CTG",
  "Delta BOG",
  "Delta MDE",
  "United BOG",
  "United MDE",
  "JetBlue BOG",
  "Spirit BOG",
  "Spirit MDE",
  // Airbnb + Colombia cities
  "Airbnb Bogotá",
  "Airbnb Bogota",
  "Airbnb Medellín",
  "Airbnb Medellin",
  "Airbnb Cartagena",
  "Airbnb Cali",
  "Airbnb Barranquilla",
  "Airbnb Santa Marta",
  "Airbnb Pereira",
  "Airbnb Bucaramanga",
  "Airbnb Colombia",
  // VRBO + Colombia
  "VRBO Colombia",
  "VRBO Cartagena",
  "VRBO Medellín",
  "VRBO Bogotá",
  // Booking.com + Colombia
  "Booking.com Bogotá",
  "Booking.com Bogota",
  "Booking.com Medellín",
  "Booking.com Medellin",
  "Booking.com Cartagena",
  "Booking.com Colombia",
  // Expedia + Colombia
  "Expedia Colombia",
  "Expedia Bogotá",
  "Expedia Cartagena",
  "Expedia Medellín",
  // Hotels.com + Colombia
  "Hotels.com Colombia",
  "Hotels.com Bogotá",
  "Hotels.com Cartagena",
  // Tripadvisor + Colombia
  "Tripadvisor Colombia",
  // Despegar (Latin America OTA)
  "Despegar confirmación",
  "Despegar Colombia",
  // Generic hotel + Colombia cities
  "hotel Bogotá reserva",
  "hotel Medellín reserva",
  "hotel Cartagena reserva",
  "hotel Cali reserva",
  "hotel Bogota reservation",
  "hotel Medellin reservation",
  "hotel Cartagena reservation",
  // Spanish language
  "vuelo Bogotá confirmación",
  "vuelo Medellín confirmación",
  "reserva Colombia",
  "viaje Colombia confirmación",
  "itinerario Colombia",
];

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
      try { return Buffer.from(payload.body.data, "base64").toString("utf-8"); }
      catch { return ""; }
    }
    if (payload.parts) {
      return payload.parts.map((p: any) => extractText(p)).join("\n");
    }
    return "";
  }

  const subject = msg.payload?.headers?.find((h: any) => h.name === "Subject")?.value ?? "";
  const body = extractText(msg.payload);
  return `Subject: ${subject}\n\n${body}`.slice(0, 6000);
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let limit = 200;
  try {
    const body = await req.json();
    if (body.limit) limit = Math.min(body.limit, 500);
  } catch {}

  const accessToken = await getValidAccessToken(user.id, supabase);
  if (!accessToken) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  // Run all search queries and collect unique message IDs
  const messageIds = new Set<string>();

  // Run queries in batches of 10 to avoid rate limits
  for (let i = 0; i < SEARCH_QUERIES.length; i += 10) {
    const batch = SEARCH_QUERIES.slice(i, i + 10);
    await Promise.allSettled(
      batch.map(async (q) => {
        try {
          const res = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=20`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const data = await res.json();
          if (data.messages) {
            data.messages.forEach((m: any) => messageIds.add(m.id));
          }
        } catch {}
      })
    );
  }

  if (messageIds.size === 0) {
    return NextResponse.json({
      trips: [],
      scanned: 0,
      message: "No Colombia booking emails found in your inbox.",
    });
  }

  // Fetch emails in parallel batches of 10
  const ids = Array.from(messageIds).slice(0, limit);
  const emailTexts: string[] = [];

  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    const results = await Promise.allSettled(
      batch.map(id => fetchEmailBody(id, accessToken))
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.trim()) {
        emailTexts.push(r.value);
      }
    }
  }

  if (emailTexts.length === 0) {
    return NextResponse.json({
      trips: [],
      scanned: 0,
      message: "Found emails but couldn't read them. Try again.",
    });
  }

  // Process in batches of 15 emails per AI call
  const allTrips: any[] = [];
  const batchSize = 15;

  for (let i = 0; i < emailTexts.length; i += batchSize) {
    const batch = emailTexts.slice(i, i + batchSize);
    const combined = batch.map((t, j) => `--- EMAIL ${i + j + 1} ---\n${t}`).join("\n\n");

    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{
          role: "user",
          content: `Extract ALL Colombia stays from these booking confirmation emails.
Sources include: Avianca, LATAM, Copa, American, Delta, United, JetBlue, Spirit, Wingo, EasyFly, Airbnb, VRBO, Booking.com, Expedia, Hotels.com, Despegar, and any hotel or rental in Colombia.

Colombia cities: Bogotá, Medellín, Cali, Cartagena, Barranquilla, Santa Marta, Pereira, Bucaramanga, Armenia, Manizales, Ibagué, Cúcuta, Villavicencio, San Andrés, and anywhere else in Colombia.
Colombia airport codes: BOG, MDE, CLO, CTG, BAQ, SMR, PEI, BGA, ADZ, CUC, AXM, IBE, MTR.

RULES:
- Flight TO Colombia (one-way): start_date = end_date = arrival date in Colombia
- Flight FROM Colombia (one-way): start_date = end_date = departure date from Colombia
- Round trip flight: start_date = Colombia arrival, end_date = Colombia departure
- Hotel/Airbnb/VRBO/rental: start_date = check-in date, end_date = check-out date
- If same trip appears in multiple emails, create ONE entry using earliest arrival and latest departure
- location is always "colombia"
- note: brief description e.g. "Avianca BOG", "Airbnb Medellín", "Hotel Cartagena", "LATAM round trip BOG"
- Skip cancelled or refunded bookings
- Skip non-Colombia bookings entirely

Return ONLY a valid JSON array, no markdown, no explanation:
[{"start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD","location":"colombia","note":"..."}]

If nothing found: []

EMAILS:
${combined}`,
        }],
      });

      const text = message.content.find(b => b.type === "text")?.text ?? "[]";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) allTrips.push(...parsed);
    } catch {}
  }

  // Validate and deduplicate by start_date + end_date
  const seen = new Set<string>();
  const valid = allTrips.filter((t: any) => {
    if (!t.start_date || !t.end_date || t.location !== "colombia") return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t.start_date)) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t.end_date)) return false;
    const key = `${t.start_date}|${t.end_date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({
    trips: valid,
    scanned: emailTexts.length,
    message: `Scanned ${emailTexts.length} emails across ${SEARCH_QUERIES.length} search terms. Found ${valid.length} Colombia stay${valid.length !== 1 ? "s" : ""}.`,
  });
}
