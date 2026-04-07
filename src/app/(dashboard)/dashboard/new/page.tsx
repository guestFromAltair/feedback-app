"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

export default function NewWorkspacePage() {
    const router = useRouter()
    const [name, setName] = useState<string>("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const slug = slugify(name)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await fetch("/api/orgs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            router.push(`/dashboard/${data.slug}`)
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-lg">
            <div className="mb-8">
                <h1 className="text-2xl font-medium">Create a workspace</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    A workspace is where your team collects feedback
                </p>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Workspace name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        required
                    />
                    {slug && (
                        <p className="text-xs text-muted-foreground">
                            URL: feedback.app/<span className="font-medium">{slug}</span>
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !name}
                    className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create workspace"}
                </button>
            </form>
        </div>
    )
}