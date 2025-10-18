"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  CreditCard,
  ShoppingBag,
  Utensils,
  Home,
} from "lucide-react"

// Mock data for financial analysis
const monthlySpending = [
  { month: "Jan", amount: 2400, receipts: 45 },
  { month: "Feb", amount: 1800, receipts: 38 },
  { month: "Mar", amount: 3200, receipts: 52 },
  { month: "Apr", amount: 2800, receipts: 48 },
  { month: "May", amount: 3600, receipts: 61 },
  { month: "Jun", amount: 2900, receipts: 49 },
]

const categorySpending = [
  { category: "Food & Dining", amount: 1240, icon: Utensils, color: "hsl(var(--chart-1))" },
  { category: "Shopping", amount: 980, icon: ShoppingBag, color: "hsl(var(--chart-2))" },
  { category: "Bills & Utilities", amount: 850, icon: Home, color: "hsl(var(--chart-3))" },
  { category: "Subscriptions", amount: 420, icon: CreditCard, color: "hsl(var(--chart-4))" },
  { category: "Other", amount: 410, icon: DollarSign, color: "hsl(var(--chart-5))" },
]

const recurringCharges = [
  { name: "Netflix", amount: 15.99, frequency: "Monthly", nextDate: "2025-11-01", category: "Entertainment" },
  { name: "Spotify", amount: 9.99, frequency: "Monthly", nextDate: "2025-11-05", category: "Entertainment" },
  { name: "AWS", amount: 42.5, frequency: "Monthly", nextDate: "2025-11-10", category: "Business" },
  { name: "Adobe Creative Cloud", amount: 54.99, frequency: "Monthly", nextDate: "2025-11-15", category: "Software" },
]

const fraudAlerts = [
  {
    id: 1,
    merchant: "Unknown Vendor XYZ",
    amount: 299.99,
    date: "2025-10-15",
    location: "Unknown Location",
    risk: "high",
  },
  {
    id: 2,
    merchant: "Suspicious Transaction",
    amount: 89.5,
    date: "2025-10-12",
    location: "Foreign Country",
    risk: "medium",
  },
]

const spendingPatterns = [
  { pattern: "Overspending on Food", severity: "high", description: "Your food spending is 40% above average" },
  { pattern: "Multiple Subscriptions", severity: "medium", description: "8 active subscriptions detected" },
  { pattern: "Low Investment Activity", severity: "low", description: "Consider increasing savings rate" },
]

export function FinancialAnalysisDashboard() {
  const totalSpending = monthlySpending.reduce((sum, month) => sum + month.amount, 0)
  const avgMonthly = totalSpending / monthlySpending.length
  const currentMonth = monthlySpending[monthlySpending.length - 1].amount
  const trend = currentMonth > avgMonthly ? "up" : "down"
  const trendPercent = Math.abs(((currentMonth - avgMonthly) / avgMonthly) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Analysis</h2>
        <p className="text-muted-foreground">Insights from your email receipts and transaction history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-chart-3" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMonth.toLocaleString()}</div>
            <p className={`text-xs ${trend === "up" ? "text-destructive" : "text-chart-3"}`}>
              {trend === "up" ? "+" : "-"}
              {trendPercent}% from average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring Charges</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${recurringCharges.reduce((sum, charge) => sum + charge.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{recurringCharges.length} subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
                <CardDescription>Your spending over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: {
                      label: "Amount",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlySpending}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Distribution of your expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: {
                      label: "Amount",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySpending}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {categorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Detailed view of spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorySpending.map((category) => {
                  const Icon = category.icon
                  const percentage = (
                    (category.amount / categorySpending.reduce((sum, c) => sum + c.amount, 0)) *
                    100
                  ).toFixed(1)
                  return (
                    <div key={category.category} className="flex items-center gap-4">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{category.category}</p>
                          <p className="font-semibold">${category.amount.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${percentage}%`, backgroundColor: category.color }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Charges</CardTitle>
              <CardDescription>Active subscriptions and recurring payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recurringCharges.map((charge, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{charge.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{charge.category}</Badge>
                        <span className="text-sm text-muted-foreground">{charge.frequency}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Next charge: {charge.nextDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${charge.amount}</p>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection Alerts</CardTitle>
              <CardDescription>Suspicious transactions requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border-l-4 rounded-lg ${
                      alert.risk === "high" ? "border-destructive bg-destructive/5" : "border-chart-4 bg-chart-4/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`w-5 h-5 ${alert.risk === "high" ? "text-destructive" : "text-chart-4"}`}
                          />
                          <p className="font-semibold">{alert.merchant}</p>
                          <Badge variant={alert.risk === "high" ? "destructive" : "secondary"}>
                            {alert.risk.toUpperCase()} RISK
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Amount: ${alert.amount}</p>
                          <p>Date: {alert.date}</p>
                          <p>Location: {alert.location}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Mark Safe
                        </Button>
                        <Button size="sm" variant="destructive">
                          Report Fraud
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Patterns & Recommendations</CardTitle>
              <CardDescription>AI-powered insights about your financial habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spendingPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className={`p-4 border-l-4 rounded-lg ${
                      pattern.severity === "high"
                        ? "border-destructive bg-destructive/5"
                        : pattern.severity === "medium"
                          ? "border-chart-4 bg-chart-4/5"
                          : "border-chart-2 bg-chart-2/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{pattern.pattern}</p>
                          <Badge
                            variant={
                              pattern.severity === "high"
                                ? "destructive"
                                : pattern.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {pattern.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-lg mb-3">💡 Financial Recommendations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Consider reducing dining expenses by 20% to save $248/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Review and cancel unused subscriptions to save $84/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Set up automatic transfers to savings account for better financial health</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Your spending is 15% higher than similar users in your income bracket</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
