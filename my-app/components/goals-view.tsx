"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Plus, DollarSign, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Goal {
  id: string
  title: string
  target: number
  current: number
  eta: string
  suggestedContribution: number
  category: "savings" | "debt" | "investment"
}

const sampleGoals: Goal[] = [
  {
    id: "1",
    title: "Emergency Fund",
    target: 5000,
    current: 3250,
    eta: "4 months",
    suggestedContribution: 150,
    category: "savings",
  },
  {
    id: "2",
    title: "Vacation to Japan",
    target: 3500,
    current: 1200,
    eta: "8 months",
    suggestedContribution: 287.5,
    category: "savings",
  },
  {
    id: "3",
    title: "Credit Card Payoff",
    target: 2400,
    current: 1600,
    eta: "3 months",
    suggestedContribution: 266.67,
    category: "debt",
  },
  {
    id: "4",
    title: "Down Payment Fund",
    target: 20000,
    current: 8500,
    eta: "18 months",
    suggestedContribution: 638.89,
    category: "savings",
  },
]

export function GoalsView() {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "savings":
        return "bg-[#35e0b4]/20 text-[#35e0b4]"
      case "debt":
        return "bg-[#ff6e8a]/20 text-[#ff6e8a]"
      case "investment":
        return "bg-[#6ea8ff]/20 text-[#6ea8ff]"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // state: manage goals and single-account excess reserves
  const [excessReserves, setExcessReserves] = React.useState<number>(2500)
  const [goals, setGoals] = React.useState<Goal[]>(sampleGoals)

  // Add goal dialog state
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [addName, setAddName] = React.useState("")
  const [addTarget, setAddTarget] = React.useState<number | undefined>(undefined)
  const [addPercent, setAddPercent] = React.useState<number>(0)

  // Contribute dialog state
  const [contributeTarget, setContributeTarget] = React.useState<Goal | null>(null)
  const [contributeAmount, setContributeAmount] = React.useState<number>(0)

  // Handlers
  const handleCreateGoal = () => {
    if (!addName || !addTarget) return
    // Amount taken from excess reserves = percentage of current excess reserves
    const amount = Math.min(excessReserves, Math.round((addPercent / 100) * excessReserves * 100) / 100)

    const newGoal: Goal = {
      id: String(Date.now()),
      title: addName,
      target: addTarget,
      current: amount,
      eta: "-",
      suggestedContribution: 0,
      category: "savings",
    }

    setGoals((g) => [newGoal, ...g])
    setExcessReserves((r) => Math.round((r - amount) * 100) / 100)
    setAddName("")
    setAddTarget(undefined)
    setAddPercent(0)
    setIsAddOpen(false)
  }

  const openContribute = (goal: Goal) => {
    const maxContribute = Math.min(excessReserves, Math.max(0, goal.target - goal.current))
    setContributeTarget(goal)
    // default to 25% of maxContribute for convenience (rounded to cents)
    setContributeAmount(Math.round((maxContribute * 0.25) * 100) / 100)
  }

  // Withdraw state
  const [withdrawTarget, setWithdrawTarget] = React.useState<Goal | null>(null)
  const [withdrawAmount, setWithdrawAmount] = React.useState<number>(0)

  const openWithdraw = (goal: Goal) => {
    setWithdrawTarget(goal)
    // default to 25% of goal.current
    setWithdrawAmount(Math.round((goal.current * 0.25) * 100) / 100)
  }

  const handleWithdraw = () => {
    if (!withdrawTarget) return
    const amount = Math.min(withdrawAmount, withdrawTarget.current)
    if (amount <= 0) return

    setGoals((prev) => prev.map((g) => (g.id === withdrawTarget.id ? { ...g, current: Math.round((g.current - amount) * 100) / 100 } : g)))
    setExcessReserves((r) => Math.round((r + amount) * 100) / 100)
    setWithdrawTarget(null)
  }

  const handleContribute = () => {
    if (!contributeTarget) return
    const maxNeeded = contributeTarget.target - contributeTarget.current
    const amount = Math.min(contributeAmount, excessReserves, Math.max(0, maxNeeded))
    if (amount <= 0) return

    setGoals((prev) => prev.map((g) => (g.id === contributeTarget.id ? { ...g, current: Math.round((g.current + amount) * 100) / 100 } : g)))
    setExcessReserves((r) => Math.round((r - amount) * 100) / 100)
    setContributeTarget(null)
  }

  return (
    <div className="px-4 max-w-md mx-auto pb-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Goals</h2>
          <p className="text-sm text-muted-foreground">Track your financial targets</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Goal</DialogTitle>
              <DialogDescription>Create a new goal and allocate some of your excess reserves to kick it off.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Name</label>
                <Input value={addName} onChange={(e) => setAddName((e.target as HTMLInputElement).value)} placeholder="e.g., New Camera" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Target Amount</label>
                <Input type="number" value={addTarget ?? ""} onChange={(e) => setAddTarget(Number((e.target as HTMLInputElement).value))} placeholder="500" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Percent of excess reserves to allocate: {addPercent}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={addPercent}
                  onChange={(e) => setAddPercent(Number((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">Available excess reserves: ${excessReserves.toFixed(2)}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateGoal} className="bg-primary">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary card */}
      <Card className="p-4 mb-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Total Progress</h3>
            <p className="text-sm text-muted-foreground">Across all goals</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Saved</span>
            <span className="font-semibold text-foreground">${goals.reduce((sum, goal) => sum + goal.current, 0).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Target</span>
            <span className="font-semibold text-foreground">${goals.reduce((sum, goal) => sum + goal.target, 0).toFixed(2)}</span>
          </div>
          <Progress
            value={
              (goals.reduce((sum, goal) => sum + goal.current, 0) / goals.reduce((sum, goal) => sum + goal.target, 0)) * 100
            }
            className="h-2"
          />
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Excess reserves:</span>
            <span className="font-semibold ml-2">${excessReserves.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Goals list */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100

          return (
            <Card key={goal.id} className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{goal.title}</h3>
                  <Badge variant="secondary" className={getCategoryColor(goal.category)}>
                    {goal.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-lg font-bold text-primary">{progress.toFixed(0)}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      ${goal.current.toFixed(2)} of ${goal.target.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">${(goal.target - goal.current).toFixed(2)} to go</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>ETA: {goal.eta}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#35e0b4]">
                    <TrendingUp className="w-4 h-4" />
                    <span>+${goal.suggestedContribution.toFixed(2)}/mo</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => openContribute(goal)}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Contribute
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => openWithdraw(goal)}>
                    Withdraw
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty state for when there are no goals */}
      {goals.length === 0 && (
        <Card className="p-8 text-center bg-card border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No goals yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first financial goal to get started</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </Card>
      )}

      {/* Contribute dialog */}
      <Dialog open={!!contributeTarget} onOpenChange={(open) => { if (!open) setContributeTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to {contributeTarget?.title}</DialogTitle>
            <DialogDescription>Move money from excess reserves into this goal.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Amount (max available ${excessReserves.toFixed(2)})</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={contributeTarget ? Math.min(excessReserves, Math.max(0, contributeTarget.target - contributeTarget.current)) : 0}
                  step={0.01}
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(Number((e.target as HTMLInputElement).value))}
                  className="flex-1"
                />
                <div className="w-28 text-right font-medium">${contributeAmount.toFixed(2)}</div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Goal needs: ${contributeTarget ? (contributeTarget.target - contributeTarget.current).toFixed(2) : "0.00"}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setContributeTarget(null)}>Cancel</Button>
            <Button onClick={handleContribute} className="bg-primary">Contribute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw dialog */}
      <Dialog open={!!withdrawTarget} onOpenChange={(open) => { if (!open) setWithdrawTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw from {withdrawTarget?.title}</DialogTitle>
            <DialogDescription>Return funds from this goal back to your excess reserves.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Amount (max {withdrawTarget ? `$${withdrawTarget.current.toFixed(2)}` : "$0.00"})</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={withdrawTarget ? withdrawTarget.current : 0}
                  step={0.01}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number((e.target as HTMLInputElement).value))}
                  className="flex-1"
                />
                <div className="w-28 text-right font-medium">${withdrawAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setWithdrawTarget(null)}>Cancel</Button>
            <Button onClick={handleWithdraw} className="bg-primary">Withdraw</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
