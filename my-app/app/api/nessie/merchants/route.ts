import { NextResponse } from "next/server"
import { getAllMerchants, getMerchant } from "@/lib/nessie-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const merchantId = searchParams.get("merchantId")

  try {
    if (merchantId) {
      const merchant = await getMerchant(merchantId)
      return NextResponse.json(merchant)
    } else {
      const merchants = await getAllMerchants()
      return NextResponse.json(merchants)
    }
  } catch (error) {
    console.error("[v0] Error in merchants API:", error)
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 })
  }
}
