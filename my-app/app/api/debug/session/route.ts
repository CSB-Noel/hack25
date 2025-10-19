import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    // Return session info without exposing full tokens
    return NextResponse.json({
      hasAccessToken: !!session.accessToken,
      accessTokenPrefix: session.accessToken?.slice(0, 50),
      error: session.error,
      user: session.user,
    })
  } catch (error) {
    console.error("Session debug error:", error)
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 })
  }
}
