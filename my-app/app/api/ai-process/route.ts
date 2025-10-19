import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { GmailService } from "@/lib/gmail-service";
import { OutlookService } from "@/lib/outlook-service";

type CachedData = {
  timestamp: number;
  result: any;
};

// ✅ Top-level cache so it persists between requests
const cache: Record<string, CachedData> = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function POST(request: NextRequest) {
  try {
    const { provider, maxResults = 20 } = await request.json();
    const session = await getServerSession(authOptions);

    if (!session?.accessToken || !provider) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `${session.user?.email}-${provider}`;
    const cached = cache[cacheKey];

    // ✅ Return cached result if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, result: cached.result });
    }

    // 1️⃣ Fetch emails
    let emailText = "";
    let emailJson: any[] = [];
    if (provider === "gmail") {
      const gmail = new GmailService(session.accessToken);
      emailText = await gmail.getMessagesAsText(maxResults);
      emailJson = await gmail.getMessages(maxResults);
    } else if (provider === "outlook") {
      const outlook = new OutlookService(session.accessToken);
      emailText = await outlook.getMessagesAsText(maxResults);
      emailJson = await outlook.getMessages(maxResults);
    } else {
      throw new Error("Unknown provider");
    }


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
    “email”: “Spotify has updated its subscription pricing. Your monthly plan will now cost $10.99, up from $9.99. The new rate takes effect with your next billing cycle. You don’t need to take any action, but you can review your plan or cancel anytime in your account settings.”
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
        model: "google/gemini-2.5-flash", // or another model like "mistral-7b" or "claude-3-haiku"
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
      }),
    });

    const aiData = await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      console.error("AI API Error:", aiData);
      throw new Error(aiData.error?.message || "Failed to fetch AI response");
    }

    const summary = aiData.choices?.[0]?.message?.content || "[]";

    // 3️⃣ Return summary (or store in DB)
    let summaryJson;
    try {
      summaryJson = JSON.parse(summary); // Parse AI JSON output
    } catch {
      summaryJson = [];
    }

    cache[cacheKey] = {
      timestamp: Date.now(),
      result: summaryJson,
    };

    return NextResponse.json({ success: true, result: summaryJson });

  } catch (error: any) {
    console.error("❌ /api/ai-process error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}