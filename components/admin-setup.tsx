// "use client"

// import type React from "react"

// import { useState } from "react"
// import { createUserWithEmailAndPassword } from "firebase/auth"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"

// interface AdminSetupProps {
//   onSetupComplete: () => void
// }

// export function AdminSetup({ onSetupComplete }: AdminSetupProps) {
//   const [email, setEmail] = useState("admin@homecare.com")
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [error, setError] = useState("")
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError("")

//     if (password !== confirmPassword) {
//       setError("Passwords do not match")
//       return
//     }

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters")
//       return
//     }

//     setLoading(true)

//     try {
//       const { auth } = await import("@/lib/firebase-client")
//       await createUserWithEmailAndPassword(auth, email, password)
//       // onSetupComplete()
//     } catch (error: any) {
//       setError(error.message || "Failed to create admin account")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <CardTitle className="text-2xl font-bold text-[#30495F]">Admin Registration</CardTitle>
//           <CardDescription>Create your admin account to get started</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="email">Admin Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   disabled={loading}
//                   minLength={6}
//                   className="pr-10"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={loading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 text-gray-400" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-gray-400" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword">Confirm Password</Label>
//               <div className="relative">
//                 <Input
//                   id="confirmPassword"
//                   type={showConfirmPassword ? "text" : "password"}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   required
//                   disabled={loading}
//                   minLength={6}
//                   className="pr-10"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   disabled={loading}
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="h-4 w-4 text-gray-400" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-gray-400" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <Button type="submit" className="w-full bg-[#30495F] hover:bg-[#30495F]/90" disabled={loading}>
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Creating Account...
//                 </>
//               ) : (
//                 "Create Admin Account"
//               )}
//             </Button>
//           </form>

//           <div className="text-center mt-4">
//             <p className="text-sm text-gray-600">
//               Already have an admin account?{" "}
//               <button
//                 type="button"
//                 onClick={() => (window.location.href = "/")}
//                 className="text-[#30495F] hover:underline font-medium inline-flex items-center gap-1"
//               >
//                 <ArrowLeft className="h-3 w-3" />
//                 Back to Login
//               </button>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
