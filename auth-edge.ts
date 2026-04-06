import NextAuth from "next-auth"

export const { auth: edgeAuth } = NextAuth({
    session: { strategy: "jwt" },
    providers: []
})