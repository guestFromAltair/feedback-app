"use client"

import {useRouter} from "next/navigation"
import {useState} from "react"

type Props = {
    token: string
    orgSlug: string
    isLoggedIn: boolean
}

export default function AcceptInviteButton({
                                               token,
                                               orgSlug,
                                               isLoggedIn,
                                           }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleAccept() {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/invite/${token}`, {
                method: "POST"
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            router.push(`/dashboard/${orgSlug}`)
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!isLoggedIn) {
        return (
            <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                    You need an account to accept this invite
                </p>

                <a href={`/signup?redirect=/invite/${token}`}
                   className="block w-full bg-black text-white rounded-lg px-4 py-2 text-sm text-center"
                >
                    Create account
                </a>
                <a href={`/login?redirect=/invite/${token}`}
                   className="block w-full border rounded-lg px-4 py-2 text-sm text-center"
                >
                    Sign in
                </a>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}
            <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            >
                {loading ? "Accepting..." : "Accept invite"}
            </button>
        </div>
    )
}