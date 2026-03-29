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
                className="text-sm border rounded-lg px-4 py-2 hover:bg-muted transition-colors"
            >
                + New post
            </button>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="border rounded-xl p-4 space-y-3 w-full max-w-md"
        >
            <p className="text-sm font-medium">New post</p>

            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                autoFocus
                required
            />

            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Description (optional)"
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                rows={3}
            />

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading || !title}
                    className="flex-1 bg-black text-white rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
                >
                    {loading ? "Posting..." : "Post"}
                </button>
                <button
                    type="button"
                    onClick={() => { setOpen(false); setTitle(""); setBody("") }}
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}