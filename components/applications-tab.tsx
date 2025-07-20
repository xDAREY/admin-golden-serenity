"use client"

import { useState, useEffect } from "react"
import type { JobApplication } from "@/lib/types"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Clock, ExternalLink, User, Mail, RefreshCw, ArrowLeft, Download, Eye, MessageSquare, Phone } from "lucide-react"
import { format } from "date-fns"
import { getFirebaseDb } from "@/lib/firebase-client"
import { ReplyForm } from "./admin/reply-form"
import { toast } from "sonner"

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

interface ApplicationsTabProps {
  onCountChange?: (newCount: number) => void
  onTotalCountChange?: (total: number) => void
}


export function ApplicationsTab({ onCountChange, onTotalCountChange}: ApplicationsTabProps) {
  const [db, setDb] = useState<any>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"list" | "detail">("list")
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const loadFirebase = async () => {
      try {
        const firestore = await getFirebaseDb()
        setDb(firestore)
      } catch (err) {
        setError("Failed to initialize Firebase")
        setLoading(false)
      }
    }

    loadFirebase()
  }, [])

  useEffect(() => {
    if (!db) return

    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            fullName: data.fullName,
            email: data.email,
            availability: data.availability,
            phone: data.phone,
            references: data.references,
            educationBackground: data.education,
            contactInformation: data.phone,
            resumeUrl: data.resume,
            status: data.status || "new",
          }
        }) as JobApplication[]

        setApplications(apps)

        const unreadCount = apps.filter(app => !app.status || app.status === 'new').length
        const totalCount = apps.length

        onCountChange?.(unreadCount)
        onTotalCountChange?.(totalCount)

        setLoading(false)
        setError(null)
      },
      (error) => {
        setError("Failed to fetch applications.")
        setLoading(false)
      }
    )

    return unsubscribe
  }, [db, onCountChange, onTotalCountChange])


  useEffect(() => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (availabilityFilter !== "all") {
      filtered = filtered.filter((app) =>
        app.availability?.toLowerCase().includes(availabilityFilter.toLowerCase())
      )
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, availabilityFilter])

  type ApplicationStatus = "new" | "reviewed" | "contacted" | "hired" | "rejected"

  const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      setUpdating(applicationId)
      const applicationRef = doc(db, "applications", applicationId)
      
      await updateDoc(applicationRef, {
        status: newStatus,
        lastViewed: new Date()
      })
      
    } catch (error) {
    } finally {
      setUpdating(null)
    }
  }

  const handleApplicationClick = async (application: JobApplication) => {
    // Mark as reviewed if it's new
    if (!application.status || application.status === 'new') {
      await updateApplicationStatus(application.id, 'reviewed')
    }
    
    setSelectedApplication(application)
    setView("detail")
  }

  const handleStatusChange = async (application: JobApplication, newStatus: ApplicationStatus) => {
    await updateApplicationStatus(application.id, newStatus)
    
    // Update the selected application state
     if (selectedApplication && selectedApplication.id === application.id) {
      setSelectedApplication({ ...selectedApplication, status: newStatus })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-green-100 text-green-800 border-green-200"
      case "reviewed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "hired":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "New"
      case "reviewed":
        return "Reviewed"
      case "contacted":
        return "Contacted"
      case "hired":
        return "Hired"
      case "rejected":
        return "Rejected"
      default:
        return "New"
    }
  }

  const refreshData = () => {
    setLoading(true)
    setError(null)
  }

  const handleBackToList = () => {
    setView("list")
    setSelectedApplication(null)
  }

  const downloadApplicationPDF = async (application: JobApplication) => {
    try {
      toast.loading("Generating PDF...")
      
      const response = await fetch("/api/download-application-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ application }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `application-${application.fullName.replace(/\s+/g, "-")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("PDF downloaded successfully")
    } catch (error) {
      toast.error("Failed to download PDF")
    }
  }

  const handleReplySuccess = () => {
    toast.success("Reply sent successfully!")
    if (selectedApplication) {
      handleStatusChange(selectedApplication, 'contacted')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#30495F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-gray-500 mb-4">Please check your Firebase configuration and authentication.</p>
          <Button onClick={refreshData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Detail View
  if (view === "detail" && selectedApplication) {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost"
            onClick={handleBackToList}
            className="flex items-center gap-2 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(selectedApplication.status || "new")}>
              {getStatusLabel(selectedApplication.status || "new")}
            </Badge>
            {(!selectedApplication.status || selectedApplication.status === 'new') && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                Unread
              </Badge>
            )}
            <Button
              onClick={() => downloadApplicationPDF(selectedApplication)}
              className="flex items-center gap-2 bg-[#30495F] hover:bg-[#30495F]/90"
            >
              <Download className="h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Application Details */}
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
                    {selectedApplication.fullName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-sm break-all">{selectedApplication.email}</p>
                  </div>
                </div>

                {selectedApplication.contactInformation && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <p className="mt-1 text-sm">{selectedApplication.contactInformation}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Received</label>
                    <p className="mt-1 text-sm">{formatDate(selectedApplication.createdAt, 'long')}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Availability</label>
                  <p className="mt-1 text-sm">{selectedApplication.availability}</p>
                </div>

                {selectedApplication.resumeUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Resume</label>
                    <div className="mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedApplication.resumeUrl, "_blank")}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Resume
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedApplication.status !== 'reviewed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selectedApplication, 'reviewed')}
                    disabled={updating === selectedApplication.id}
                    className="w-full justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Reviewed
                  </Button>
                )}
                {selectedApplication.status !== 'contacted' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(selectedApplication, 'contacted')}
                    disabled={updating === selectedApplication.id}
                    className="w-full justify-start bg-[#30495F] hover:bg-[#30495F]/90"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mark as Contacted
                  </Button>
                )}
                {updating === selectedApplication.id && (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-4 h-4 border-2 border-[#30495F] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info and Reply */}
          <div className="lg:col-span-2 space-y-6">
            {/* Education Background */}
            {selectedApplication.educationBackground && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Education Background
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedApplication.educationBackground}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* References */}
            {selectedApplication.references && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    References
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedApplication.references}
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
                  email={selectedApplication.email} 
                  onSent={handleReplySuccess}
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Availability</SelectItem>
            <SelectItem value="full time">Full Time</SelectItem>
            <SelectItem value="part time">Part Time</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Grid */}
      <div className="grid gap-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  {applications.length === 0 ? "No applications submitted yet" : "No applications match your filters"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card
              key={application.id}
              className={`hover:shadow-md transition-all cursor-pointer ${
                (!application.status || application.status === 'new') ? 'border-l-4 border-l-green-500 bg-green-50/30' : ''
              }`}
              onClick={() => handleApplicationClick(application)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-[#30495F]">{application.fullName}</h3>
                      <Badge className={getStatusColor(application.status || "new")}>
                        {getStatusLabel(application.status || "new")}
                      </Badge>
                      {(!application.status || application.status === 'new') && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                          Unread
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{application.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{application.availability}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">
                      {formatDate(application.createdAt)}
                    </div>
                    {updating === application.id && (
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