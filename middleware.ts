import { auth } from "@/auth"
import { NextResponse } from "next/server"

// This middleware depends on auth helpers that pull in Node-only dependencies
// (e.g. Prisma). Force Node.js runtime to keep the build/bundling happy.
export const runtime = "nodejs"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}