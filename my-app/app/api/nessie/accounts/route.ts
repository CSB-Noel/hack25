import { NextResponse } from "next/server"
import { getAccounts } from "@/lib/nessie-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId")

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
  }

  try {
    const accounts = await getAccounts(customerId)
    return NextResponse.json(accounts)
  } catch (error) {
    console.error("[v0] Error in accounts API:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}
