import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { GmailService } from "@/lib/gmail-service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.accessToken) {
      console.error("No access token found!");
      return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get("maxResults") || "10");
    const format = searchParams.get("format") || "structured";
    const filter = searchParams.get("filter"); // optional (e.g. 'financial')

    const gmail = new GmailService(session.accessToken);

    let result;
    if (format === "text") {
      result = await gmail.getMessagesAsText(maxResults);
      return new NextResponse(result, { headers: { "Content-Type": "text/plain" } });
    }

    if (filter === "financial") {
      result = await gmail.getFinancialMessages(maxResults);
    } else {
      result = await gmail.getAIReadableMessages(maxResults);
    }

    return NextResponse.json({ count: result.length, messages: result });
  } catch (error) {
    console.error("Gmail API error:", error);
    return NextResponse.json({ error: "Failed to fetch Gmail emails" }, { status: 500 });
  }
}
