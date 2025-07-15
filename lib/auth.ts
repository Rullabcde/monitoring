import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("=== AUTHORIZE FUNCTION ===")
        console.log("Received credentials:", {
          username: credentials?.username,
          hasPassword: !!credentials?.password,
        })
        console.log("Environment check:", {
          envUsername: process.env.ADMIN_USERNAME,
          hasEnvPassword: !!process.env.ADMIN_PASSWORD,
        })

        // Simple admin check - in production, use proper password hashing
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          console.log("✅ Authorization successful")
          const user = {
            id: "1",
            name: "Admin",
            email: "admin@monitor.local",
            role: "admin",
          }
          console.log("Returning user:", user)
          return user
        }

        console.log("❌ Authorization failed")
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("=== JWT CALLBACK ===")
      console.log("Token:", token)
      console.log("User:", user)
      console.log("Account:", account)

      if (user) {
        token.role = user.role
        console.log("✅ JWT token updated with user data")
      }

      console.log("Final token:", token)
      return token
    },
    async session({ session, token }) {
      console.log("=== SESSION CALLBACK ===")
      console.log("Session:", session)
      console.log("Token:", token)

      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        console.log("✅ Session updated with token data")
      }

      console.log("Final session:", session)
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("=== REDIRECT CALLBACK ===")
      console.log("URL:", url)
      console.log("Base URL:", baseUrl)

      // Allows relative callback URLs
      if (url.startsWith("/")) {
        const finalUrl = `${baseUrl}${url}`
        console.log("✅ Redirecting to:", finalUrl)
        return finalUrl
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.log("✅ Redirecting to:", url)
        return url
      }

      console.log("✅ Redirecting to base URL:", baseUrl)
      return baseUrl
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("=== SIGNIN EVENT ===")
      console.log("User signed in:", user)
    },
    async session({ session, token }) {
      console.log("=== SESSION EVENT ===")
      console.log("Session accessed:", session)
    },
  },
  debug: true, // Enable debug mode
}
