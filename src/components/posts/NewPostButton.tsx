"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
    boardId: string
}

export default function NewPostButton({ boardId }: Props) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/boards/${boardId}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, body }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setOpen(false)
            setTitle("")
            setBody("")
            router.refresh()
        } catch {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="w-full text-xs border rounded-lg px-3 py-2 hover:bg-muted transition-colors whitespace-nowrap"
            >
                + New post
            </button>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="border bg-white shadow-sm rounded-xl p-4 space-y-3 w-full sm:max-w-md"
        >
            <p className="text-sm font-semibold">New post</p>

            {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                // text-base on mobile prevents iOS auto-zoom
                className="w-full border rounded-lg px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-black"
                autoFocus
                required
            />

            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Description (optional)"
                className="w-full border rounded-lg px-3 py-2 text-base sm:text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black"
                rows={3}
            />

            <div className="flex gap-2 pt-1">
                <button
                    type="submit"
                    disabled={loading || !title}
                    className="flex-1 bg-black text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
                >
                    {loading ? "Posting..." : "Post"}
                </button>
                <button
                    type="button"
                    onClick={() => { setOpen(false); setTitle(""); setBody("") }}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}