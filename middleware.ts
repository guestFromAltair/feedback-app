import { edgeAuth } from "./auth-edge"
import { NextResponse } from "next/server"
import {NextAuthRequest} from "next-auth";

export default edgeAuth((req: NextAuthRequest) => {
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