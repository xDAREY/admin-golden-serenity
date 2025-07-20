// Sample data to populate Firestore collections for testing
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample job applications
const sampleApplications = [
  {
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    contactInformation: "Phone: (555) 123-4567\nAddress: 123 Main St, City, State 12345",
    references: "Dr. Emily Smith - Previous Supervisor\nPhone: (555) 987-6543\nEmail: emily.smith@hospital.com",
    educationBackground: "Bachelor of Science in Nursing\nState University, 2020\nCertified Nursing Assistant (CNA)",
    availability: "Full Time",
    status: "new",
    resumeUrl: "https://example.com/resume-sarah.pdf",
    createdAt: serverTimestamp(),
  },
  {
    fullName: "Michael Chen",
    email: "michael.chen@email.com",
    contactInformation: "Phone: (555) 234-5678\nAddress: 456 Oak Ave, City, State 12345",
    references: "Maria Rodriguez - Care Coordinator\nPhone: (555) 876-5432\nEmail: maria.r@careservice.com",
    educationBackground: "Associate Degree in Health Sciences\nCommunity College, 2019\nHome Health Aide Certification",
    availability: "Part Time",
    status: "reviewed",
    resumeUrl: "https://example.com/resume-michael.pdf",
    createdAt: serverTimestamp(),
  },
  {
    fullName: "Jennifer Williams",
    email: "jennifer.williams@email.com",
    contactInformation: "Phone: (555) 345-6789\nAddress: 789 Pine St, City, State 12345",
    references: "Robert Davis - Clinical Manager\nPhone: (555) 765-4321\nEmail: robert.davis@clinic.com",
    educationBackground: "Master of Social Work\nUniversity College, 2018\n5 years experience in elder care",
    availability: "Flexible",
    status: "contacted",
    createdAt: serverTimestamp(),
  },
]

// Sample contact messages
const sampleInquiries = [
  {
    fullName: "Robert Thompson",
    email: "robert.thompson@email.com",
    phone: "(555) 456-7890",
    message:
      "Hello, I'm interested in home care services for my elderly mother. She needs assistance with daily activities and medication management. Could you please provide more information about your services and pricing?",
    status: "new",
    createdAt: serverTimestamp(),
  },
  {
    fullName: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    phone: "(555) 567-8901",
    message:
      "My father recently had surgery and needs temporary home care assistance during his recovery. We're looking for someone who can help with mobility and basic care tasks. What are your availability and rates?",
    status: "reviewed",
    createdAt: serverTimestamp(),
  },
  {
    fullName: "David Martinez",
    email: "david.martinez@email.com",
    phone: "(555) 678-9012",
    message:
      "I need information about long-term care options for my spouse who has dementia. We're looking for compassionate caregivers who have experience with memory care. Please contact me to discuss our needs.",
    status: "responded",
    createdAt: serverTimestamp(),
  },
]

async function seedData() {
  try {
    for (const application of sampleApplications) {
      await addDoc(collection(db, "job_applications"), application)
    }

    for (const inquiry of sampleInquiries) {
      await addDoc(collection(db, "contact_messages"), inquiry)
    }

  } catch (error) {
  }
}

seedData()
