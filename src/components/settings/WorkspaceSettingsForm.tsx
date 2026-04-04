"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
    orgId: string
    currentName: string
    currentSlug: string
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

export default function WorkspaceSettingsForm({orgId, currentName, currentSlug}: Props) {
    const router = useRouter()
    const [name, setName] = useState(currentName)
    const [slug, setSlug] = useState(currentSlug)
    const [slugEdited, setSlugEdited] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    function handleNameChange(value: string) {
        setName(value)
        if (!slugEdited) {
            setSlug(slugify(value))
        }
    }

    function handleSlugChange(value: string) {
        setSlugEdited(true)
        setSlug(slugify(value))
    }

    const hasChanges = name !== currentName || slug !== currentSlug

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!hasChanges) return

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const res = await fetch(`/api/orgs/${orgId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setSuccess(true)
            setSlugEdited(false)

            if (slug !== currentSlug) {
                router.push(`/dashboard/${slug}/settings`)
            } else {
                router.refresh()
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                </p>
            )}

            {success && (
                <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    Settings saved successfully
                </p>
            )}

            <div className="space-y-1.5">
                <label className="text-sm font-medium">
                    Workspace name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                    maxLength={50}
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium">
                    Workspace URL
                </label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r">
                    feedbacker.app/
                  </span>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-background outline-none"
                        required
                        maxLength={50}
                    />
                </div>
                {slug !== currentSlug && (
                    <p className="text-xs text-amber-600">
                        Changing the URL will break existing links to your public boards
                    </p>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading || !hasChanges || !name || !slug}
                    className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 cursor-pointer
                    transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
                >
                    {loading ? "Saving..." : "Save changes"}
                </button>
            </div>
        </form>
    )
}