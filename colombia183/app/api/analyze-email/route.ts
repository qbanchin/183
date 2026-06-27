import { NextRequest, NextResponse } from "next/server";
import Anthropic from "anthropic";
import { createClient } from "@/lib/supabase-server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { emailText } = await req.json();
  if (!emailText?.trim()) {
    return NextResponse.json({ error: "No email text provided" }, { status: 400 });
  }

  if (emailText.length > 20000) {
    return NextResponse.json({ error: "Email text too long (max 20,000 characters)" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Extract all Colombia-related flight trips from this email. For each Colombia stay, determine the arrival and departure dates.

Rules:
- If it's a one-way flight TO Colombia: start_date = end_date = flight date
- If it's a one-way flight FROM Colombia: start_date = end_date = flight date
- If it's a round trip (same email has both legs): start_date = arrival in Colombia, end_date = departure from Colombia
- location is always "colombia"
- note should be a short description like "MIA→BOG" or "Round trip BOG↔MIA"

Colombia airports: BOG (Bogotá), MDE (Medellín), CLO (Cali), CTG (Cartagena), BAQ (Barranquilla), SMR (Santa Marta), PEI (Pereira), BGA (Bucaramanga), ADZ (San Andrés), CUC (Cúcuta), AXM (Armenia), IBE (Ibagué), MTR (Montería)

Return ONLY a valid JSON array. No explanation, no markdown. Example:
[{"start_date":"2025-07-15","end_date":"2025-08-03","location":"colombia","note":"MIA→BOG round trip"}]

If no Colombia flights found, return: []

Email text:
${emailText}`,
    }],
  });

  const text = message.content.find(b => b.type === "text")?.text ?? "[]";

  let trips: unknown[];
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    trips = JSON.parse(cleaned);
    if (!Array.isArray(trips)) trips = [];
  } catch {
    trips = [];
  }

  // Validate each entry
  const valid = trips.filter((t: any) =>
    t.start_date && t.end_date && t.location === "colombia" &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.start_date) &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.end_date)
  );

  return NextResponse.json({ trips: valid });
}
