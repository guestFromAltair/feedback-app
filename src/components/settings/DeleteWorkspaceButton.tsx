"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
    orgId: string
    orgName: string
}

export default function DeleteWorkspaceButton({ orgId, orgName }: Props) {
    const router = useRouter()
    const [confirming, setConfirming] = useState(false)
    const [confirmText, setConfirmText] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isConfirmed = confirmText === orgName

    async function handleDelete() {
        if (!isConfirmed) return
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/orgs/${orgId}`, {
                method: "DELETE"
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.error)
                return
            }

            router.push("/dashboard")
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
            setLoading(false)
        }
    }

    if (!confirming) {
        return (
            <button
                onClick={() => setConfirming(true)}
                className="text-sm text-red-600 border border-red-200 rounded-lg px-4 py-2 cursor-pointer hover:bg-red-50 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
            >
                Delete workspace
            </button>
        )
    }

    return (
        <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium mb-1">
                    This will permanently delete:
                </p>
                <ul className="text-sm text-red-600 space-y-0.5 list-disc list-inside">
                    <li>All boards in this workspace</li>
                    <li>All posts, votes and comments</li>
                    <li>All team memberships</li>
                </ul>
            </div>

            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}

            <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">
                    Type{" "}
                    <span className="font-medium text-foreground">{orgName}</span>{" "}
                    to confirm
                </label>
                <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={orgName}
                    className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-300"
                    autoFocus
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleDelete}
                    disabled={!isConfirmed || loading}
                    className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 hover:bg-red-700 transition-colors"
                >
                    {loading ? "Deleting..." : "Delete permanently"}
                </button>
                <button
                    onClick={() => {
                        setConfirming(false)
                        setConfirmText("")
                        setError(null)
                    }}
                    className="border rounded-lg px-4 py-2 text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}