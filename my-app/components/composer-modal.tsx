"use client"

import { useState } from "react"
import { X, Paperclip, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ComposerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ComposerModal({ open, onOpenChange }: ComposerModalProps) {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")

  const handleSend = () => {
    // Handle send logic
    onOpenChange(false)
    setTo("")
    setSubject("")
    setBody("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-card border-border max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground">New Message</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <Input
                placeholder="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div>
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div>
              <Textarea
                placeholder="Compose your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[200px] bg-background border-border resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between flex-shrink-0">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button onClick={handleSend} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
