"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Send } from "lucide-react"

export function ReplyForm({ email, onSent }: { email: string; onSent?: () => void }) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    // Validation
    if (!subject.trim()) {
      toast.error("Subject is required")
      return
    }

    if (!message.trim()) {
      toast.error("Message is required")
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          to: email, 
          subject: subject.trim(), 
          message: message.trim() 
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success("Reply sent successfully!")
        setSubject("")
        setMessage("")
        onSent?.()
      } else {
        // Handle API errors
        const errorMessage = data.error || "Failed to send reply"
        toast.error(errorMessage)
      }
    } catch (err: any) {
      // Handle network or unexpected errors
      toast.error("Network error: Failed to send reply")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend()
    }
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Reply to: <span className="text-[#30495F] font-semibold">{email}</span>
        </label>
      </div>
      
      <div>
        <label htmlFor="subject" className="text-sm font-medium text-gray-700 mb-1 block">
          Subject
        </label>
        <Input
          id="subject"
          placeholder="Enter email subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={loading}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium text-gray-700 mb-1 block">
          Message
        </label>
        <Textarea
          id="message"
          rows={6}
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          onKeyDown={handleKeyDown}
        />
        <p className="text-xs text-gray-500 mt-1">
          Press Ctrl+Enter (or Cmd+Enter on Mac) to send
        </p>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSend} 
          disabled={loading || !subject.trim() || !message.trim()}
          className="flex items-center gap-2 bg-[#30495F] hover:bg-[#30495F]/90"
        >
          <Send className="h-4 w-4" />
          {loading ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </div>
  )
}