export interface JobApplication {
  id: string
  fullName: string
  email: string
  contactInformation: string
  references: string
  educationBackground: string
  availability: string
  resumeUrl?: string
  status: "new" | "reviewed" | "contacted" | "hired" | "rejected"
  createdAt: Date
}


export interface ContactMessage {
  id: string
  fullName: string
  name: string
  email: string
  phone: string
  message: string
  status: "new" | "reviewed" | "responded"
  createdAt: Date
}
