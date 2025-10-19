import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { OutlookService } from "@/lib/outlook-service"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log("=== SESSION DEBUG ===")
    console.log("Has session:", !!session)
    console.log("Has accessToken:", !!session?.accessToken)
    console.log("Session error:", session?.error)
    console.log("User:", session?.user)

    if (!session?.accessToken) {
      console.error("No access token found!")
      return NextResponse.json({ error: "No access token found" }, { status: 401 })
    }

    // Check if there was a token refresh error
    if (session.error === "RefreshAccessTokenError") {
      console.error("Token refresh failed - user needs to re-authenticate")
      return NextResponse.json(
        { error: "Token expired. Please sign in again." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const maxResults = parseInt(searchParams.get("maxResults") || "20")
    const format = searchParams.get("format") || "structured"

    console.log("Access Token (first 50 chars):", session.accessToken?.slice(0, 50))
    
    // Decode token to check scopes
    try {
      const tokenParts = session.accessToken.split(".")
      const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString())
      console.log("Token scopes:", payload.scp)
      console.log("Token expires:", new Date(payload.exp * 1000).toISOString())
      console.log("Token audience:", payload.aud)
    } catch (e) {
      console.error("Failed to decode token:", e)
    }

    const outlook = new OutlookService(session.accessToken!)

    if (format === "text") {
      const text = await outlook.getMessagesAsText(maxResults)
      return new NextResponse(text, { headers: { "Content-Type": "text/plain" } })
    }

    const messages = await outlook.getMessages(maxResults)
    return NextResponse.json({ count: messages.length, messages })
  } catch (error) {
    console.error("Outlook API error:", error)
    return NextResponse.json({ error: "Failed to fetch Outlook emails" }, { status: 500 })
  }
}