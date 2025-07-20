"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { FileText, MessageSquare, LogOut, Menu, X, BarChart3, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  activeTab: "applications" | "inquiries"
  onTabChange: (tab: "applications" | "inquiries") => void
  unreadApplicationCount: number  
  unreadInquiryCount: number      
  totalApplicationCount?: number   
  totalInquiryCount?: number      
  onLogout: () => void
}

export function DashboardSidebar({
  activeTab,
  onTabChange,
  unreadApplicationCount,
  unreadInquiryCount,
  totalApplicationCount,
  totalInquiryCount,
  onLogout,
}: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await onLogout()
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
    // Don't set isLoggingOut to false here as the user will be redirected
    setShowLogoutDialog(false)
  }

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false)
  }

  const totalUnreadCount = unreadApplicationCount + unreadInquiryCount
  const totalCount = (totalApplicationCount || unreadApplicationCount) + (totalInquiryCount || unreadInquiryCount)

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-[#30495F]">Admin Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Home Care Management</p>
        
        {/* Quick stats */}
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-[#30495F]" />
              <span className="text-gray-600">Total Submissions:</span>
              <Badge variant="secondary" className="ml-auto">
                {totalCount}
              </Badge>
            </div>
          </div>
          
          {totalUnreadCount > 0 && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-medium">Unread Items:</span>
                <Badge className="ml-auto bg-red-100 text-red-800 border-red-200">
                  {totalUnreadCount}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Button
          variant={activeTab === "applications" ? "default" : "ghost"}
          className={cn(
            "w-full justify-start relative",
            activeTab === "applications" 
              ? "bg-[#30495F] hover:bg-[#30495F]/90 text-white" 
              : "hover:bg-gray-100",
          )}
          onClick={() => {
            onTabChange("applications")
            setIsOpen(false)
          }}
        >
          <FileText className="mr-3 h-4 w-4" />
          <div className="flex-1 text-left">
            <div className="font-medium">Applications</div>
            <div className="text-xs opacity-75">Job submissions</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {unreadApplicationCount > 0 && (
              <Badge 
                variant={activeTab === "applications" ? "secondary" : "default"}
                className={cn(
                  "text-xs",
                  activeTab === "applications" 
                    ? "bg-white/20 text-white border-white/30" 
                    : "bg-red-100 text-red-800 border-red-200"
                )}
              >
                {unreadApplicationCount} new
              </Badge>
            )}
            {totalApplicationCount && totalApplicationCount !== unreadApplicationCount && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  activeTab === "applications" ? "border-white/30 text-white/70" : ""
                )}
              >
                {totalApplicationCount} total
              </Badge>
            )}
          </div>
        </Button>

        <Button
          variant={activeTab === "inquiries" ? "default" : "ghost"}
          className={cn(
            "w-full justify-start relative",
            activeTab === "inquiries" 
              ? "bg-[#30495F] hover:bg-[#30495F]/90 text-white" 
              : "hover:bg-gray-100",
          )}
          onClick={() => {
            onTabChange("inquiries")
            setIsOpen(false)
          }}
        >
          <MessageSquare className="mr-3 h-4 w-4" />
          <div className="flex-1 text-left">
            <div className="font-medium">Inquiries</div>
            <div className="text-xs opacity-75">Contact messages</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {unreadInquiryCount > 0 && (
              <Badge 
                variant={activeTab === "inquiries" ? "secondary" : "default"}
                className={cn(
                  "text-xs",
                  activeTab === "inquiries" 
                    ? "bg-white/20 text-white border-white/30" 
                    : "bg-red-100 text-red-800 border-red-200"
                )}
              >
                {unreadInquiryCount} new
              </Badge>
            )}
            {totalInquiryCount && totalInquiryCount !== unreadInquiryCount && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  activeTab === "inquiries" ? "border-white/30 text-white/70" : ""
                )}
              >
                {totalInquiryCount} total
              </Badge>
            )}
          </div>
        </Button>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-3 text-center">
          {totalCount === 0 
            ? "No submissions yet" 
            : totalUnreadCount > 0
              ? `${totalUnreadCount} unread of ${totalCount} total`
              : `All ${totalCount} items read`
          }
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <div className="mr-3 h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </>
          )}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Logout
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your admin account? You'll need to log back in to access the dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BarChart3 className="h-4 w-4" />
              <span>Current session summary:</span>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Unread Applications:</span>
                <Badge variant="outline" className="h-5">
                  {unreadApplicationCount}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Unread Inquiries:</span>
                <Badge variant="outline" className="h-5">
                  {unreadInquiryCount}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleLogoutCancel}
              disabled={isLoggingOut}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogoutConfirm}
              disabled={isLoggingOut}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? (
                <>
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Yes, Logout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}