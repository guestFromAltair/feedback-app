"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
    boardId: string
}

export default function SubmitPostForm({ boardId }: Props) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/boards/${boardId}/posts/public`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, body, name, email }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setSuccess(true)
            setOpen(false)
            setTitle("")
            setBody("")
            setName("")
            setEmail("")
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="border rounded-xl p-4 text-center">
                <p className="text-sm text-green-700 font-medium">
                    Thanks for your feedback!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Your post is now visible on the board.
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="text-xs underline text-muted-foreground mt-2"
                >
                    Submit another
                </button>
            </div>
        )
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="w-full border rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors text-left"
            >
                + Submit feedback or a feature request...
            </button>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="border rounded-xl p-4 space-y-3"
        >
            <p className="text-sm font-medium">Submit feedback</p>

            {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                </p>
            )}

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title — what's your idea or issue?"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                autoFocus
                required
            />

            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Description (optional) — tell us more..."
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="border rounded-lg px-3 py-2 text-sm"
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="border rounded-lg px-3 py-2 text-sm"
                    required
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading || !title || !name || !email}
                    className="flex-1 bg-black text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Submit feedback"}
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}