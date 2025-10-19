import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
// Assuming these imports are correctly set up
import { GmailService } from "@/lib/gmail-service";
import { OutlookService } from "@/lib/outlook-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log("🔍 Session from /api/ai-process:", session);


    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider"); // e.g. gmail

    // 1️⃣ Fetch insights from Supabase (email-based)
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("financial_insights")
      .select("results")
      .eq("user_email", session.user.email)
      .order("created_at", { ascending: false });

    if (provider) {
      query = query.eq("provider", provider);
    }

    const { data: supabaseData, error: supabaseError } = await query;
    if (supabaseError) throw supabaseError;

    const emailInsights = supabaseData.flatMap((row: any) => row.insights || []);

    // 2️⃣ Fetch Nessie insights from local Flask or FastAPI backend
    let nessieInsights: any[] = [];
    try {
      const nessieRes = await fetch("http://localhost:8000/fetch_insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: [] }),
      });

      if (nessieRes.ok) {
        const nessieData = await nessieRes.json();

        // Handle raw AI responses that might come wrapped in code blocks
        if (nessieData.result) {
          const cleaned = nessieData.result.replace(/```json\s*/i, "").replace(/```/g, "").trim();
          nessieInsights = JSON.parse(cleaned);
        }
      } else {
        console.error("⚠️ Nessie API failed:", await nessieRes.text());
      }
    } catch (err) {
      console.error("❌ Failed to fetch Nessie insights:", err);
    }

    // 3️⃣ Combine and clean
    const combinedInsights = [...emailInsights, ...nessieInsights].map((insight) => ({
      ...insight,
      amount: insight.amount ?? 0,
    }));

    return NextResponse.json({
      success: true,
      insights: combinedInsights,
    });
  } catch (error: any) {
    console.error("❌ /api/ai-process GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider, maxResults = 20 } = await request.json();
    const session = await getServerSession(authOptions);

    if (!session?.accessToken || !provider) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("FATAL: OPENROUTER_API_KEY is missing.");
      return NextResponse.json({ error: "AI service key missing" }, { status: 500 });
    }

    // 1️⃣ Fetch emails
    let emailJson: any[] = [];
    if (provider === "gmail") {
      const gmail = new GmailService(session.accessToken);
      // NOTE: Using getMessages, not getMessagesAsText, as emailText is unused
      emailJson = await gmail.getMessages(maxResults);
    } else if (provider === "outlook") {
      const outlook = new OutlookService(session.accessToken);
      // NOTE: Using getMessages, not getMessagesAsText, as emailText is unused
      emailJson = await outlook.getMessages(maxResults);
    } else {
      throw new Error("Unknown provider");
    }

    // --- IMPORTANT DEBUGGING CHECK ---
    console.log(`Emails Fetched: ${emailJson.length} for Provider: ${provider}`);
    if (emailJson.length === 0) {
        // If no emails are found, the AI would correctly return [], so we can return early.
        return NextResponse.json({ success: true, result: [] });
    }
    // --- END DEBUGGING CHECK ---


    const prompt = `
Given the INPUT below, return a JSON array summarizing all relevant financial items (bills, subscriptions, transactions, anomalies, or goals).

### INPUT
${JSON.stringify({ count: emailJson.length, messages: emailJson }, null, 2)}

### INSTRUCTIONS
1. Parse the email messages for with TASKS
2. Each JSON object in the output represents one detected financial insight or event.
3. Only include items related to financial activity (e.g., purchases, bills, subscriptions, payment alerts, or fraud).
4. Ignore irrelevant newsletters, promotions, or personal messages unless they include financial intent or transactions.
5. If no financial items are found, return an empty array \`[]\`.
6. Return valid JSON only. Do not include explanations or markdown.


**IMPORTANT: Ensure the output is in json format

Use the following STRICT format for the output:
{
  id: string, // unique incremental ID
  kind: "subscription" | "bill" | "anomaly" | "goal" | "advice",
  title: string, // short summary title
  merchantOrBill: string, // name of the company or service (e.g., "Amazon", "Spotify")
  amount: number, // detected or estimated charge amount, if known
  date: string, // ISO 8601 format (from the email or inferred)
  account: string, // payment method or source if available, else "Unknown"
  category: string, // e.g., "Shopping", "Utilities", "Subscriptions"
  delta30: number, // change vs last 30 days (estimate or 0 if unknown)
  delta90: number, // change vs last 90 days (estimate or 0 if unknown)
  email: string, // summary of email body, focusing on the finances
  aiHeader: {
    bullets: string[], // 2–4 key AI insights
    nextStep: string, // a recommended action, less than 5 words
    badges: string[], // short tags like ["priority", "priceUp", "duplicateSub", "dueSoon", "anomaly"]
    confidence: number // 0.0–1.0
  }
}

### OUTPUT EXAMPLE
[
  {
    "id": "1",
    "kind": "subscription",
    "title": "Spotify price increased",
    "merchantOrBill": "Spotify",
    "amount": 10.99,
    "date": "2025-10-01T10:22:00Z",
    "account": "Capital One Savor",
    "category": "Entertainment",
    "delta30": 1.0,
    "delta90": 1.0,
    "email": "Spotify has updated its subscription pricing. Your monthly plan will now cost $10.99, up from $9.99. The new rate takes effect with your next billing cycle. You don’t need to take any action, but you can review your plan or cancel anytime in your account settings.",
    "aiHeader": {
      "bullets": [
        "Price up $1.00 vs last month",
        "Duplicate service: also paying Apple Music",
        "Low usage in past 60 days"
      ],
      "nextStep": "Keep Spotify, cancel Apple Music?",
      "badges": ["priority", "priceUp", "Subscriptions"],
      "confidence": 0.91
    }
  }
]

`;

    // 2️⃣ Send emails to OpenRouter AI
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", 
        messages: [
          {
            role: "system",
            content: `
            ROLE: You are a financial insights assistant.

Based on a provided email json input, extract actionable financial insights through scanning through one or more emails to detect financial activity such as bills, subscriptions, purchases, anomalies, and payment-related alerts. Do this by following the TASKS.

TASKS:
            1. Classify each email as a relevant financial type: subscription, bill, anomaly, goal, or advice.
            2. Extract key details: merchant name, amount, date, account, category.
            3. Summarize financial insights in short, actionable points.
            4. Provide a recommended next step for the user.
            5. Assign confidence scores (0.0-1.0) and relevant badges (e.g., priority, dueSoon, anomaly, priceUp, duplicateSub).
            6. Only return JSON in the specified output format. Do not include explanations, markdown, or text outside JSON.

            Always focus on actionable financial insights, ignoring unrelated newsletters or personal messages unless they contain financial data. Prioritize reading dates, amounts, merchants, subscriptions, bills, and anomalies from the email text.  Do not invent content that is not present. Be precise and concise.
            Ensure the output is valid JSON and adheres strictly to the provided format.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        // You could also experiment with OpenRouter's 'format' parameter here
        // if your model supports it for more reliable JSON output.
      }),
    });

    const aiData = await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      console.error("AI API Error Status:", openRouterResponse.status);
      console.error("AI API Error Data:", aiData);
      throw new Error(aiData.error?.message || "Failed to fetch AI response");
    }

    const summary = aiData.choices?.[0]?.message?.content || "[]";

    // --- CRITICAL FIX: Clean markdown fences before parsing ---
    // This removes leading/trailing ```json\n or ``` tags which often break JSON.parse()
    const cleanedSummary = summary.replace(/```json\n|```/g, '').trim();

    // 3️⃣ Return summary (or store in DB)
    let summaryJson;
    try {
      summaryJson = JSON.parse(cleanedSummary); // Parse AI JSON output
      console.log("JSON parsed successfully.");
    } catch (e) {
      console.error("❌ JSON Parse Failed on AI Output:", e);
      console.error("❌ Raw (Cleaned) Content that failed parsing:", cleanedSummary);
      // Fallback to empty array if parsing fails
      summaryJson = [];
    }
    // --- END CRITICAL FIX ---
    try {
      const supabase = createSupabaseServerClient();
      const { error: dbError } = await supabase
        .from("financial_insights")
        .insert({
          user_email: session.user?.email,
          provider,
          results: summaryJson,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("⚠️ Failed to insert into Supabase:", dbError);
      } else {
        console.log("✅ Insights saved to Supabase");
      }
    } catch (e) {
      console.error("⚠️ Supabase insert failed:", e);
    }



    return NextResponse.json({ success: true, result: summaryJson });

  } catch (error: any) {
    console.error("❌ /api/ai-process error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
