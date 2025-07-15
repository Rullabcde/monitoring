import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

console.log("NextAuth API route loaded")
console.log("Environment check:", {
  hasAdminUsername: !!process.env.ADMIN_USERNAME,
  hasAdminPassword: !!process.env.ADMIN_PASSWORD,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
})

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
