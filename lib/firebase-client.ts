"use client"

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { firebaseConfig } from "./firebase"

let cachedApp: FirebaseApp | null = null
let cachedAuth: any = null
let cachedDb: any = null
// let cachedStorage: any = null

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Firebase must be initialized in the browser.")
  }
}

export async function getFirebaseApp() {
  ensureBrowser()
  if (!cachedApp) {
    cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }
  return cachedApp
}

export async function getFirebaseAuth() {
  ensureBrowser()
  if (!cachedAuth) {
    const app = await getFirebaseApp()
    const { getAuth } = await import("firebase/auth")
    cachedAuth = getAuth(app)
  }
  return cachedAuth
}



export async function getFirebaseDb() {
  ensureBrowser()
  if (!cachedDb) {
    const app = await getFirebaseApp()
    const { getFirestore } = await import("firebase/firestore")
    cachedDb = getFirestore(app)
  }
  return cachedDb
}

// export async function getFirebaseStorage() {
//   ensureBrowser()
//   if (!cachedStorage) {
//     const app = await getFirebaseApp()
//     const { getStorage } = await import("firebase/storage")
//     cachedStorage = getStorage(app)
//   }
//   return cachedStorage
// }
