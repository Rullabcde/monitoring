import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    console.log("=== MIDDLEWARE ===")
    console.log("Path:", req.nextUrl.pathname)
    console.log("Has token:", !!req.nextauth.token)
    console.log("Token:", req.nextauth.token)

    // If accessing root and not authenticated, redirect to login
    if (req.nextUrl.pathname === "/" && !req.nextauth.token) {
      console.log("❌ No token for root path, redirecting to login")
      return NextResponse.redirect(new URL("/login", req.url))
    }

    console.log("✅ Middleware passed")
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        console.log("=== AUTHORIZED CALLBACK ===")
        console.log("Path:", path)
        console.log("Has token:", !!token)

        // Allow access to login page without token
        if (path === "/login") {
          console.log("✅ Login page - access allowed")
          return true
        }

        // Allow access to debug page without token (development only)
        if (path === "/debug" && process.env.NODE_ENV === "development") {
          console.log("✅ Debug page - access allowed")
          return true
        }

        // For all other pages, require token
        const hasAccess = !!token
        console.log(hasAccess ? "✅ Token present - access allowed" : "❌ No token - access denied")
        return hasAccess
      },
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
