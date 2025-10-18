"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock, DollarSign, CheckCircle2 } from "lucide-react"

// Mock suggested tasks from emails
const suggestedTasks = [
  {
    id: 1,
    title: "Pay Electricity Bill",
    description: "Payment due for October electricity bill",
    dueDate: "2025-10-25",
    amount: 124.5,
    category: "Bills",
    priority: "high",
    source: "Power Company Email",
  },
  {
    id: 2,
    title: "Amazon Package Delivery",
    description: "Package arriving - be home to receive",
    dueDate: "2025-10-18",
    amount: 89.99,
    category: "Shopping",
    priority: "medium",
    source: "Amazon Order Confirmation",
  },
  {
    id: 3,
    title: "Netflix Subscription Renewal",
    description: "Subscription will auto-renew",
    dueDate: "2025-11-14",
    amount: 15.99,
    category: "Subscriptions",
    priority: "low",
    source: "Netflix Receipt",
  },
  {
    id: 4,
    title: "Review AWS Charges",
    description: "Monthly AWS bill available for review",
    dueDate: "2025-10-20",
    amount: 42.5,
    category: "Business",
    priority: "medium",
    source: "AWS Billing",
  },
]

export function CalendarIntegration() {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])
  const [addedTasks, setAddedTasks] = useState<number[]>([])

  const handleToggleTask = (taskId: number) => {
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const handleAddToCalendar = () => {
    // Mock adding to calendar
    setAddedTasks((prev) => [...prev, ...selectedTasks])
    setSelectedTasks([])
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Calendar Integration</h2>
        <p className="text-muted-foreground">Automatically suggested tasks from your emails</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Suggested Tasks</CardTitle>
            <CardDescription>AI-detected tasks and reminders from your emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestedTasks.map((task) => {
                const isSelected = selectedTasks.includes(task.id)
                const isAdded = addedTasks.includes(task.id)

                return (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isAdded
                        ? "border-chart-3 bg-chart-3/5"
                        : isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {!isAdded && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleTask(task.id)}
                          className="mt-1"
                        />
                      )}
                      {isAdded && (
                        <div className="mt-1">
                          <CheckCircle2 className="w-5 h-5 text-chart-3" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>
                          <Badge variant={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {task.dueDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />${task.amount}
                          </div>
                          <Badge variant="outline">{task.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Source: {task.source}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedTasks.length > 0 && (
              <div className="mt-6 flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium">
                  {selectedTasks.length} task{selectedTasks.length > 1 ? "s" : ""} selected
                </p>
                <Button onClick={handleAddToCalendar}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Google Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Summary</CardTitle>
              <CardDescription>Upcoming tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{suggestedTasks.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Added to Calendar</p>
                <p className="text-2xl font-bold">{addedTasks.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{suggestedTasks.filter((t) => t.priority === "high").length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Clock className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="w-4 h-4 mr-2" />
                Sync Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
