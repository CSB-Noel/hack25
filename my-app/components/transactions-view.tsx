"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react"

interface Transaction {
  id: string
  merchant: string
  category: string
  amount: number
  date: string
  account: string
  type: "outflow" | "inflow"
  badges?: string[]
}

const sampleTransactions: Transaction[] = [
  {
    id: "1",
    merchant: "Whole Foods",
    category: "Groceries",
    amount: 87.43,
    date: "2025-10-18",
    account: "Capital One Savor",
    type: "outflow",
  },
  {
    id: "2",
    merchant: "Spotify",
    category: "Entertainment",
    amount: 10.99,
    date: "2025-10-17",
    account: "Chase Checking",
    type: "outflow",
    badges: ["recurring", "priceUp"],
  },
  {
    id: "3",
    merchant: "Salary Deposit",
    category: "Income",
    amount: 3500.0,
    date: "2025-10-15",
    account: "Chase Checking",
    type: "inflow",
  },
  {
    id: "4",
    merchant: "Amazon",
    category: "Shopping",
    amount: 287.43,
    date: "2025-10-12",
    account: "Capital One Savor",
    type: "outflow",
    badges: ["anomaly"],
  },
  {
    id: "5",
    merchant: "Pacific Gas & Electric",
    category: "Utilities",
    amount: 142.5,
    date: "2025-10-10",
    account: "Chase Checking",
    type: "outflow",
    badges: ["recurring"],
  },
  {
    id: "6",
    merchant: "Starbucks",
    category: "Dining",
    amount: 6.75,
    date: "2025-10-09",
    account: "Capital One Savor",
    type: "outflow",
  },
  {
    id: "7",
    merchant: "Netflix",
    category: "Entertainment",
    amount: 15.99,
    date: "2025-10-08",
    account: "Chase Checking",
    type: "outflow",
    badges: ["recurring"],
  },
  {
    id: "8",
    merchant: "Target",
    category: "Shopping",
    amount: 54.32,
    date: "2025-10-07",
    account: "Capital One Savor",
    type: "outflow",
  },
]

export function TransactionsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "inflow" | "outflow">("all")

  const filteredTransactions = sampleTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || transaction.type === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="px-4 max-w-md mx-auto pb-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">Activity</h2>
        <p className="text-sm text-muted-foreground">All your transactions</p>
      </div>

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

        <div className="flex gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={selectedFilter === "inflow" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("inflow")}
            className="flex-1"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Income
          </Button>
          <Button
            variant={selectedFilter === "outflow" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("outflow")}
            className="flex-1"
          >
            <TrendingDown className="w-4 h-4 mr-1" />
            Spending
          </Button>
        </div>
      </div>

      {/* Transactions list */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center bg-card border-border">
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Merchant avatar */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    transaction.type === "inflow" ? "bg-[#35e0b4]/20" : "bg-primary/20"
                  }`}
                >
                  {transaction.type === "inflow" ? (
                    <TrendingUp className="w-5 h-5 text-[#35e0b4]" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-primary" />
                  )}
                </div>

                {/* Transaction details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{transaction.merchant}</h3>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-semibold ${
                          transaction.type === "inflow" ? "text-[#35e0b4]" : "text-foreground"
                        }`}
                      >
                        {transaction.type === "inflow" ? "+" : "-"}${transaction.amount.toFixed(2)}
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
    </div>
  )
}
