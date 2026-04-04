"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
    orgId: string
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

export default function NewBoardButton({ orgId }: Props) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/orgs/${orgId}/boards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    slug: slugify(name),
                    isPublic
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setOpen(false)
            setName("")
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
                + New board
            </button>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="border rounded-xl p-4 space-y-3 w-full max-w-sm"
        >
            <p className="text-sm font-medium">New board</p>

            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}

            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Board name (e.g. Feature requests)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                autoFocus
                required
            />

            <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded"
                />
                Make this board public
            </label>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading || !name}
                    className="flex-1 bg-black text-white rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create"}
                </button>
                <button
                    type="button"
                    onClick={() => { setOpen(false); setName("") }}
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}