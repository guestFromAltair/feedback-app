"use client"

import React, { useState } from "react"

type Props = {
    orgId: string
}

export default function InviteForm({ orgId }: Props) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch(`/api/orgs/${orgId}/invites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setSuccess(`Invite sent to ${email}`)
            setEmail("")
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="border rounded-xl p-4">
            <p className="text-sm font-medium mb-3">Invite a teammate</p>

            {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                    {error}
                </p>
            )}

            {success && (
                <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                    {success}
                </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm min-w-0"
                    required
                />
                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
                        className="flex-1 sm:flex-none border rounded-lg px-2 py-2 text-sm bg-background"
                    >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading || !email}
                        className="flex-1 sm:flex-none bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 whitespace-nowrap"
                    >
                        {loading ? "Sending..." : "Send invite"}
                    </button>
                </div>
            </form>
        </div>
    )
}