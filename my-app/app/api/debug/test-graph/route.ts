import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 })
    }

    // Test 1: Get user profile (simpler endpoint)
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    console.log("User endpoint status:", userResponse.status)

    if (!userResponse.ok) {
      const userError = await userResponse.text()
      console.log("User endpoint error:", userError)
    }

    const userData = userResponse.ok ? await userResponse.json() : null

    // Test 2: Try to get mail folders
    const foldersResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/mailFolders",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    )

    console.log("Folders endpoint status:", foldersResponse.status)

    if (!foldersResponse.ok) {
      const foldersError = await foldersResponse.text()
      console.log("Folders endpoint error:", foldersError)
    }

    const foldersData = foldersResponse.ok ? await foldersResponse.json() : null

    // Test 3: Try to get messages
    const messagesResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/messages?$top=1",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    )

    console.log("Messages endpoint status:", messagesResponse.status)

    if (!messagesResponse.ok) {
      const messagesError = await messagesResponse.text()
      console.log("Messages endpoint error:", messagesError)
    }

    const messagesData = messagesResponse.ok
      ? await messagesResponse.json()
      : null

    return NextResponse.json({
      user: {
        status: userResponse.status,
        data: userData,
      },
      folders: {
        status: foldersResponse.status,
        data: foldersData,
      },
      messages: {
        status: messagesResponse.status,
        data: messagesData,
      },
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({ error: "Test failed" }, { status: 500 })
  }
}
