import { NextResponse } from "next/server"
import { getTransactions } from "@/lib/nessie-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")

  if (!accountId) {
    return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
  }

  try {
    const transactions = await getTransactions(accountId)
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("[v0] Error in transactions API:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
