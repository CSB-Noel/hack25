"use client"

import { useState } from "react"
import { Search, Clock, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  starred: boolean
  category: "inbox" | "sent" | "archived"
}

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    from: "Sarah Chen",
    subject: "Q4 Product Roadmap Review",
    preview: "Hi team, I wanted to share the updated roadmap for Q4...",
    date: "2h ago",
    starred: false,
    category: "inbox",
  },
  {
    id: "2",
    from: "Marcus Johnson",
    subject: "Design System Updates",
    preview: "The new component library is ready for review...",
    date: "4h ago",
    starred: true,
    category: "inbox",
  },
  {
    id: "3",
    from: "Emily Rodriguez",
    subject: "Team Offsite Planning",
    preview: "Looking forward to our team offsite next month...",
    date: "1d ago",
    starred: false,
    category: "sent",
  },
  {
    id: "4",
    from: "David Kim",
    subject: "Budget Approval Request",
    preview: "Please review the attached budget proposal...",
    date: "2d ago",
    starred: true,
    category: "archived",
  },
]

const recentSearches = ["Q4 roadmap", "design system", "budget", "team meeting"]

export function SearchView() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim()) {
      setIsSearching(true)
      // Simulate search delay
      setTimeout(() => {
        const filtered = mockSearchResults.filter(
          (result) =>
            result.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.preview.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setResults(filtered)
        setIsSearching(false)
      }, 300)
    } else {
      setResults([])
      setIsSearching(false)
    }
  }

  return (
    <div className="px-4 max-w-md mx-auto pb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Search</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search emails, contacts, or content..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-card border-border h-12"
          />
        </div>
      </div>

      {!query && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Starred Messages
            </h3>
            <div className="space-y-2">
              {mockSearchResults
                .filter((r) => r.starred)
                .map((result) => (
                  <Card key={result.id} className="p-3 bg-card border-border hover:bg-card/80 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {result.from
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm text-foreground truncate">{result.from}</p>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{result.date}</span>
                        </div>
                        <p className="text-sm text-foreground font-medium mb-1 truncate">{result.subject}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{result.preview}</p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}

      {query && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            {isSearching ? "Searching..." : `${results.length} results for "${query}"`}
          </h3>
          <div className="space-y-2">
            {results.map((result) => (
              <Card key={result.id} className="p-3 bg-card border-border hover:bg-card/80 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {result.from
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-foreground truncate">{result.from}</p>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {result.starred && <Star className="w-3 h-3 fill-primary text-primary" />}
                        <span className="text-xs text-muted-foreground">{result.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground font-medium mb-1 truncate">{result.subject}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{result.preview}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs capitalize flex-shrink-0",
                          result.category === "inbox" && "bg-primary/20 text-primary",
                          result.category === "sent" && "bg-secondary",
                          result.category === "archived" && "bg-muted",
                        )}
                      >
                        {result.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
