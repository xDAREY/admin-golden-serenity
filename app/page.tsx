"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/contexts/auth-context"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ApplicationsTab } from "@/components/applications-tab"
import { InquiriesTab } from "@/components/inquiries-tab"
import { collection, onSnapshot } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-client"
import router from "next/router"

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"applications" | "inquiries">("applications")

  const [unreadApplicationCount, setUnreadApplicationCount] = useState(0)
  const [unreadInquiryCount, setUnreadInquiryCount] = useState(0)
  const [totalApplicationCount, setTotalApplicationCount] = useState(0)
  const [totalInquiryCount, setTotalInquiryCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const initCounts = async () => {
      try {
        const db = await getFirebaseDb()

        const unsubscribeApps = onSnapshot(
          collection(db, "job_applications"),
          (snapshot) => {
            const all = snapshot.docs
            const unread = all.filter((doc) => {
              const status = doc.data().status
              return !status || status === "new"
            })

            setTotalApplicationCount(all.length)
            setUnreadApplicationCount(unread.length)
          },
          (error) => {
            setTotalApplicationCount(0)
            setUnreadApplicationCount(0)
          }
        )

        const unsubscribeContacts = onSnapshot(
          collection(db, "contacts"), // adjust if yours is named 'contact_messages'
          (snapshot) => {
            const all = snapshot.docs
            const unread = all.filter((doc) => {
              const status = doc.data().status
              return !status || status === "new"
            })

            setTotalInquiryCount(all.length)
            setUnreadInquiryCount(unread.length)
          },
          (error) => {
            setTotalInquiryCount(0)
            setUnreadInquiryCount(0)
          }
        )

        return () => {
          unsubscribeApps()
          unsubscribeContacts()
        }
      } catch (err) {
      }
    }

    let cleanup: (() => void) | undefined
    initCounts().then((fn) => (cleanup = fn))

    return () => {
      if (cleanup) cleanup()
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#30495F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <LoginForm
        onLogin={() => {
          router.replace("/")
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadApplicationCount={unreadApplicationCount}
        unreadInquiryCount={unreadInquiryCount}
        totalApplicationCount={totalApplicationCount}
        totalInquiryCount={totalInquiryCount}
        onLogout={logout}
      />

      <main className="flex-1 lg:ml-0 ml-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#30495F] mb-2">
              {activeTab === "applications" ? "Job Applications" : "Contact Inquiries"}
            </h2>
            <p className="text-gray-600">
              {activeTab === "applications"
                ? `Manage and review job applications from potential candidates (${totalApplicationCount} total)`
                : `View and respond to contact form submissions (${totalInquiryCount} total)`}
            </p>
          </div>

          {activeTab === "applications" ? (
            <ApplicationsTab
              onCountChange={setUnreadApplicationCount}
              onTotalCountChange={setTotalApplicationCount}
            />
          ) : (
            <InquiriesTab
              onCountChange={setUnreadInquiryCount}
              onTotalCountChange={setTotalInquiryCount}
            />
          )}
        </div>
      </main>
    </div>
  )
}
