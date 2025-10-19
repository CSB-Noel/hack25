import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 })
    }

    // Decode JWT (just the payload, no verification)
    const parts = token.split(".")
    if (parts.length !== 3) {
      return NextResponse.json({ error: "Invalid JWT format" }, { status: 400 })
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString())
    
    return NextResponse.json({
      scopes: payload.scp,
      audience: payload.aud,
      issuer: payload.iss,
      expires: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
      subject: payload.sub,
      // Full payload for debugging
      fullPayload: payload
    })
  } catch (error) {
    console.error("Token decode error:", error)
    return NextResponse.json({ error: "Failed to decode token" }, { status: 500 })
  }
}
