"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Plus, DollarSign, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

  return (
    <div className="px-4 max-w-md mx-auto pb-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Goals</h2>
          <p className="text-sm text-muted-foreground">Track your financial targets</p>
        </div>
        <Button size="icon" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
          <Plus className="w-5 h-5" />
        </Button>
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
            <span className="font-semibold text-foreground">
              ${sampleGoals.reduce((sum, goal) => sum + goal.current, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Target</span>
            <span className="font-semibold text-foreground">
              ${sampleGoals.reduce((sum, goal) => sum + goal.target, 0).toFixed(2)}
            </span>
          </div>
          <Progress
            value={
              (sampleGoals.reduce((sum, goal) => sum + goal.current, 0) /
                sampleGoals.reduce((sum, goal) => sum + goal.target, 0)) *
              100
            }
            className="h-2"
          />
        </div>
      </Card>

      {/* Goals list */}
      <div className="space-y-3">
        {sampleGoals.map((goal) => {
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

                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Contribute Now
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty state for when there are no goals */}
      {sampleGoals.length === 0 && (
        <Card className="p-8 text-center bg-card border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No goals yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first financial goal to get started</p>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </Card>
      )}
    </div>
  )
}
