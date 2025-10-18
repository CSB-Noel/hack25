const NESSIE_API_KEY = process.env.NESSIE_API_KEY || "YOUR_API_KEY_HERE"
const NESSIE_BASE_URL = "http://api.nessieisreal.com"

export interface NessieAccount {
  _id: string
  type: string
  nickname: string
  rewards: number
  balance: number
  account_number: string
  customer_id: string
}

export interface NessieTransaction {
  _id: string
  type: "debit" | "credit"
  transaction_date: string
  status: string
  medium: string
  payer_id: string
  payee_id: string
  amount: number
  description: string
}

export interface NessieMerchant {
  _id: string
  name: string
  category: string[]
  address: {
    street_number: string
    street_name: string
    city: string
    state: string
    zip: string
  }
  geocode: {
    lat: number
    lng: number
  }
}

// Get all accounts for a customer
export async function getAccounts(customerId: string): Promise<NessieAccount[]> {
  try {
    const response = await fetch(`${NESSIE_BASE_URL}/customers/${customerId}/accounts?key=${NESSIE_API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch accounts")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching accounts:", error)
    return []
  }
}

// Get transactions for an account
export async function getTransactions(accountId: string): Promise<NessieTransaction[]> {
  try {
    const response = await fetch(`${NESSIE_BASE_URL}/accounts/${accountId}/purchases?key=${NESSIE_API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch transactions")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }
}

// Get merchant details
export async function getMerchant(merchantId: string): Promise<NessieMerchant | null> {
  try {
    const response = await fetch(`${NESSIE_BASE_URL}/merchants/${merchantId}?key=${NESSIE_API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch merchant")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching merchant:", error)
    return null
  }
}

// Get all merchants
export async function getAllMerchants(): Promise<NessieMerchant[]> {
  try {
    const response = await fetch(`${NESSIE_BASE_URL}/merchants?key=${NESSIE_API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch merchants")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching merchants:", error)
    return []
  }
}

// Create a new purchase transaction
export async function createPurchase(
  accountId: string,
  purchase: {
    merchant_id: string
    medium: string
    purchase_date: string
    amount: number
    description?: string
  },
): Promise<{ code: number; message: string; objectCreated: NessieTransaction } | null> {
  try {
    const response = await fetch(`${NESSIE_BASE_URL}/accounts/${accountId}/purchases?key=${NESSIE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(purchase),
    })
    if (!response.ok) throw new Error("Failed to create purchase")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error creating purchase:", error)
    return null
  }
}

// Get account balance
export async function getAccountBalance(accountId: string): Promise<number> {
  try {
    const response = await fetch(`${NESSIE_BASE_URL}/accounts/${accountId}?key=${NESSIE_API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch account")
    const account: NessieAccount = await response.json()
    return account.balance
  } catch (error) {
    console.error("[v0] Error fetching account balance:", error)
    return 0
  }
}
