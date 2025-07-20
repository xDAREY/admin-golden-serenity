"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-client"
import type { ContactMessage } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, Search, Phone, Mail, Eye, Clock, User } from "lucide-react"
import { ReplyForm } from "./admin/reply-form"

const formatDate = (date: Date, formatType: 'short' | 'long' = 'short') => {
  if (formatType === 'long') {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  })
}

interface InquiriesTabProps {
  onCountChange?: (newCount: number) => void
  onTotalCountChange?: (total: number) => void

}

export function InquiriesTab({ onCountChange, onTotalCountChange }: InquiriesTabProps) {
  const [inquiries, setInquiries] = useState<ContactMessage[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<ContactMessage[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<ContactMessage | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const db = await getFirebaseDb()
        
        const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"))

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as ContactMessage[]

            setInquiries(messages)
            
            // Update the count for unread inquiries (status 'new' or undefined)
            const unreadCount = messages.filter(msg => !msg.status || msg.status === 'new').length
            const totalCount = messages.length

            onCountChange?.(unreadCount)
            onTotalCountChange?.(totalCount)

            
            setLoading(false)
            setError(null)
          },
          (error) => {
            console.error("Error fetching inquiries:", error)
            setError("Failed to fetch inquiries: " + error.message)
            setLoading(false)
          }
        )

        return unsubscribe
      } catch (error) {
        console.error("Firestore setup error:", error)
        setError("Firestore setup error: " + (error as Error).message)
        setLoading(false)
      }
    }

    fetchInquiries()
  }, [onCountChange, onTotalCountChange])

  useEffect(() => {
    let filtered = inquiries

    if (searchTerm) {
      filtered = filtered.filter(
        (inquiry) =>
          inquiry.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inquiry.phone && inquiry.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredInquiries(filtered)
  }, [inquiries, searchTerm])

  type InquiryStatus = "new" | "reviewed" | "responded"

  const updateInquiryStatus = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      setUpdating(inquiryId)
      const db = await getFirebaseDb()
      const inquiryRef = doc(db, "contacts", inquiryId)
      
      await updateDoc(inquiryRef, {
        status: newStatus,
        lastViewed: new Date()
      })
      
      console.log(`Updated inquiry ${inquiryId} status to ${newStatus}`)
    } catch (error) {
      console.error("Error updating inquiry status:", error)
    } finally {
      setUpdating(null)
    }
  }

  const handleInquiryClick = async (inquiry: ContactMessage) => {
    // Mark as reviewed if it's new
    if (!inquiry.status || inquiry.status === 'new') {
      await updateInquiryStatus(inquiry.id, 'reviewed')
    }
    
    setSelectedInquiry(inquiry)
  }

  const handleStatusChange = async (inquiry: ContactMessage, newStatus: InquiryStatus) => {
    await updateInquiryStatus(inquiry.id, newStatus)
    
    // Update the selected inquiry state
    if (selectedInquiry && selectedInquiry.id === inquiry.id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus })
    }
  }

  const handleBack = () => {
    setSelectedInquiry(null)
  }

  const handleReplySent = () => {
    if (selectedInquiry) {
      handleStatusChange(selectedInquiry, 'responded')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-green-100 text-green-800 border-green-200"
      case "reviewed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "responded":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "New"
      case "reviewed":
        return "Reviewed" 
      case "responded":
        return "Responded"
      default:
        return "New"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#30495F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <p className="text-gray-500 mt-2">Please check your Firebase configuration and authentication.</p>
        </div>
      </div>
    )
  }

  // Detail View
  if (selectedInquiry) {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inquiries
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(selectedInquiry.status || "new")}>
              {getStatusLabel(selectedInquiry.status || "new")}
            </Badge>
            {(!selectedInquiry.status || selectedInquiry.status === 'new') && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                Unread
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Inquiry Details */}
          <div className="lg:col-span-1 space-y-4">
            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm font-semibold text-[#30495F]">
                    {selectedInquiry.fullName || "Not provided"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-sm break-all">{selectedInquiry.email}</p>
                  </div>
                </div>

                {selectedInquiry.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <p className="mt-1 text-sm">{selectedInquiry.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Received</label>
                    <p className="mt-1 text-sm">{formatDate(selectedInquiry.createdAt, 'long')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedInquiry.status !== 'reviewed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selectedInquiry, 'reviewed')}
                    disabled={updating === selectedInquiry.id}
                    className="w-full justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Reviewed
                  </Button>
                )}
                {selectedInquiry.status !== 'responded' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(selectedInquiry, 'responded')}
                    disabled={updating === selectedInquiry.id}
                    className="w-full justify-start bg-[#30495F] hover:bg-[#30495F]/90"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mark as Responded
                  </Button>
                )}
                {updating === selectedInquiry.id && (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-4 h-4 border-2 border-[#30495F] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Message and Reply */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message */}
            {selectedInquiry.message && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5" />
                    Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedInquiry.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reply Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Send Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <ReplyForm 
                  email={selectedInquiry.email} 
                  onSent={handleReplySent}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredInquiries.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-gray-500">
                {searchTerm ? "No inquiries found matching your search" : "No inquiries received yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInquiries.map((inquiry) => (
            <Card
              key={inquiry.id}
              className={`hover:shadow-md transition-all cursor-pointer ${
                (!inquiry.status || inquiry.status === 'new') ? 'border-l-4 border-l-green-500 bg-green-50/30' : ''
              }`}
              onClick={() => handleInquiryClick(inquiry)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-[#30495F]">{inquiry.fullName || "Anonymous"}</h3>
                      <Badge className={getStatusColor(inquiry.status || "new")}>
                        {getStatusLabel(inquiry.status || "new")}
                      </Badge>
                      {(!inquiry.status || inquiry.status === 'new') && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                          Unread
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{inquiry.email}</span>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{inquiry.phone}</span>
                        </div>
                      )}
                      {inquiry.message && (
                        <p className="text-sm text-gray-600 truncate mt-2">
                          {inquiry.message.substring(0, 100)}
                          {inquiry.message.length > 100 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">
                      {formatDate(inquiry.createdAt)}
                    </div>
                    {updating === inquiry.id && (
                      <div className="w-4 h-4 border-2 border-[#30495F] border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}