"use client"

import React, {useState} from "react"
import {useRouter} from "next/navigation"

type Props = {
    postId: string
    userName: string
}

export default function CommentForm({postId, userName}: Props) {
    const router = useRouter()
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!body.trim()) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({body}),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setBody("")
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
                <div
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                    {userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "?"}
                </div>
                <div className="flex-1">
                  <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-border"
                      rows={3}
                      required
                  />
                </div>
            </div>

            {error && (
                <p className="text-xs text-red-600 ml-11">{error}</p>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading || !body.trim()}
                    className="text-sm bg-black text-white rounded-lg px-4 py-2 disabled:opacity-50 transition-opacity"
                >
                    {loading ? "Posting..." : "Post comment"}
                </button>
            </div>
        </form>
    )
}