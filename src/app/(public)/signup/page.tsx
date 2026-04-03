"use client"

import React, {useEffect, useState} from "react"
import {useRouter, useSearchParams} from "next/navigation"
import { signIn } from "next-auth/react"
import {getSafeRedirect} from "@/lib/utils";
import {signupSchema} from "@/lib/schema";
import Link from "next/link";

const DEFAULT_DASHBOARD_PATH = "/dashboard";

export default function SignupPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [redirectTo, setRedirectTo] = useState(DEFAULT_DASHBOARD_PATH)

    useEffect(() => {
        setRedirectTo(getSafeRedirect(searchParams.get("redirect"), DEFAULT_DASHBOARD_PATH))
    }, [searchParams])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)

        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const result = signupSchema.safeParse({name, email, password})
        if (!result.success) {
            setError(result.error.issues[0].message)
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name, email, password})
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to create account")
                setLoading(false)
                return
            }

            const signInResult = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (signInResult?.error) {
                setError("Account created but sign in failed. Please go to login.")
                setLoading(false)
                return
            }

            router.push(redirectTo)
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
            setLoading(false)
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-xl">
        <div>
          <h1 className="text-2xl font-medium">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start collecting feedback today
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Full name"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 8 characters)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs text-muted-foreground">
            <span className="bg-background px-2">or</span>
          </div>
        </div>

        <form action={async () => {
          await signIn("github", { redirectTo: redirectTo })
        }}>
          <button
            type="submit"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            Continue with GitHub
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}