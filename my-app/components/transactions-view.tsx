"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, TrendingDown, RefreshCw, AlertCircle, Loader2 } from "lucide-react"
import { useStore } from "@/app/store"
import { normalizeAnalyzeResponse, ClassifiedItem } from "@/lib/analysis"

// Mapping table for friendly category labels (same as constellation graph)
const CATEGORY_LABEL_MAP: Record<string, string> = {
  'Fixed::Housing': 'Housing',
  'Fixed::Debt': 'Debt',
  'Fixed::Subscriptions': 'Subscriptions',
  'Variable::Groceries': 'Groceries',
  'Variable::Dining/Takeout': 'Dining',
  'Variable::Transportation': 'Transportation',
  'Variable::Health&Personal': 'Health & Personal',
  'Variable::Impulse&Wants': 'Impulse & Wants',
  'Income::Salary': 'Salary',
  'Transfer::P2P': 'P2P',
}

// Helper function to get friendly category name
function getFriendlyCategoryName(category: string): string {
  return CATEGORY_LABEL_MAP[category] || category
}

interface Transaction {
  id: string
  merchant: string
  category: string
  displayCategory: string // Friendly display name
  amount: number
  date: string
  account: string
  badges?: string[]
  description?: string
  confidence?: number
}

// Helper function to convert classified items to transactions
function classifiedToTransactions(classifiedItems: ClassifiedItem[]): Transaction[] {
  return classifiedItems.map((item) => {
    const badges: string[] = []
    
    // Add badge based on confidence level
    if (item.confidence && item.confidence > 0.9) {
      badges.push('recurring')
    }
    
    // Multiply by -1 since all transactions are costs/expenses
    const amount = Math.abs(item.amount) * -1
    
    const category = item.category || 'Uncategorized'
    const displayCategory = getFriendlyCategoryName(category)
    
    return {
      id: item.purchase_id,
      merchant: item.merchant_id || item.description || 'Unknown Merchant',
      category: category,
      displayCategory: displayCategory,
      amount: amount,
      date: item.purchase_date,
      account: 'Transaction Account', // We don't have account info from this API
      badges: badges.length > 0 ? badges : undefined,
      description: item.description,
      confidence: item.confidence
    }
  })
}

export function TransactionsView() {
  const { data: session } = useSession()
  const { analyzedData, setAnalyzedData, isDataLoading, setIsDataLoading } = useStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const fetchTransactions = async () => {
    setLoading(true)
    setIsDataLoading(true)
    try {
      console.log('[TransactionsView] Fetching from /api/analyze')
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: [] }),
      })

      if (!res.ok) throw new Error(`API returned status ${res.status}`)
      
      const data = await res.json()
      console.log('[TransactionsView] API response received')

      // Try normalization from several plausible places
      let normalized = normalizeAnalyzeResponse(data?.classified || data)

      // Fallback: if normalized empty, try debug.parsed
      if ((!normalized.classified || normalized.classified.length === 0) && data?.debug?.parsed) {
        normalized = normalizeAnalyzeResponse(data.debug.parsed)
      }

      // Fallback: try parsing debug.rawText as JSON
      if ((!normalized.classified || normalized.classified.length === 0) && data?.debug?.rawText) {
        try {
          const txt = (data.debug.rawText || '').toString()
          const firstBrace = txt.indexOf('{')
          const lastBrace = txt.lastIndexOf('}')
          const firstBracket = txt.indexOf('[')
          const lastBracket = txt.lastIndexOf(']')
          let candidate: string | null = null
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            candidate = txt.slice(firstBrace, lastBrace + 1)
          } else if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            candidate = txt.slice(firstBracket, lastBracket + 1)
          }
          if (candidate) {
            try {
              const parsedAgain = JSON.parse(candidate)
              const normalized2 = normalizeAnalyzeResponse(parsedAgain)
              if (normalized2.classified && normalized2.classified.length > 0) {
                normalized = normalized2
              }
            } catch (e) {
              console.warn('[TransactionsView] Failed to parse candidate JSON', e)
            }
          }
        } catch (e) {
          console.warn('[TransactionsView] Failed to parse rawText', e)
        }
      }

      const classifiedArray: ClassifiedItem[] = normalized.classified || []
      console.log('[TransactionsView] Classified items count:', classifiedArray.length)

      if (classifiedArray.length > 0) {
        const convertedTransactions = classifiedToTransactions(classifiedArray)
        setTransactions(convertedTransactions)
        setAnalyzedData(classifiedArray) // Cache in store
        console.log('[TransactionsView] Transactions set:', convertedTransactions.length)
      } else {
        console.log('[TransactionsView] No classified items found')
        setTransactions([])
        setAnalyzedData([])
      }
    } catch (err) {
      console.error('[TransactionsView] Error fetching transactions:', err)
      setTransactions([])
      setAnalyzedData([])
    } finally {
      setLoading(false)
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    if (!session) return
    
    // Only fetch if we don't have cached data
    if (analyzedData === null || !analyzedData) {
      console.log('[TransactionsView] No cached data, fetching...')
      fetchTransactions()
    } else {
      console.log('[TransactionsView] Using cached data:', analyzedData.length, 'items')
      const convertedTransactions = classifiedToTransactions(analyzedData)
      setTransactions(convertedTransactions)
      setLoading(false)
    }
  }, [session, analyzedData])

  // Get unique categories for filtering - use display names
  const categoryMap = new Map<string, string>() // category -> displayCategory
  transactions.forEach(t => {
    if (!categoryMap.has(t.category)) {
      categoryMap.set(t.category, t.displayCategory)
    }
  })
  const categories = Array.from(categoryMap.entries()) // [category, displayCategory] pairs
  
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.displayCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.description && transaction.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate total spending
  const totalSpending = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="px-4 max-w-md mx-auto pb-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">Activity</h2>
        <p className="text-sm text-muted-foreground">All your transactions</p>
        {!loading && transactions.length > 0 && (
          <div className="mt-2 p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Spending</p>
            <p className="text-2xl font-bold text-foreground">${totalSpending.toFixed(2)}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading transactions...</p>
        </div>
      ) : (
        <>
          {/* Search and filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            {/* Category filter dropdown/pills */}
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="flex-shrink-0"
                >
                  All
                </Button>
                {categories.map(([category, displayCategory]) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex-shrink-0"
                  >
                    {displayCategory}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Transactions list */}
          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <Card className="p-8 text-center bg-card border-border">
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {transactions.length === 0 
                    ? "No transaction data available" 
                    : "Try adjusting your filters"}
                </p>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Merchant avatar */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/20">
                      <TrendingDown className="w-5 h-5 text-primary" />
                    </div>

                    {/* Transaction details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{transaction.merchant}</h3>
                          <p className="text-sm text-muted-foreground">{transaction.displayCategory}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-foreground">
                            -${Math.abs(transaction.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.account}
                        </p>
                        {transaction.badges && transaction.badges.length > 0 && (
                          <div className="flex gap-1">
                            {transaction.badges.map((badge) => (
                              <Badge
                                key={badge}
                                variant={badge === "anomaly" ? "destructive" : "secondary"}
                                className="text-xs h-5 px-1.5"
                              >
                                {badge === "recurring" && <RefreshCw className="w-3 h-3" />}
                                {badge === "priceUp" && <TrendingUp className="w-3 h-3" />}
                                {badge === "anomaly" && <AlertCircle className="w-3 h-3" />}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
