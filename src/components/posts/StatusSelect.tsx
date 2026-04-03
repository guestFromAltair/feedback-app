"use client"

import { useState } from "react"
import { PostStatus } from "@prisma/client"
import StatusBadge from "./StatusBadge"

type Props = {
    postId: string
    currentStatus: PostStatus
}

const ALL_STATUSES: PostStatus[] = [
    "UNDER_REVIEW",
    "PLANNED",
    "IN_PROGRESS",
    "DONE"
]

export default function StatusSelect({ postId, currentStatus }: Props) {
    const [status, setStatus] = useState<PostStatus>(currentStatus)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleChange(newStatus: PostStatus) {
        if (newStatus === status) {
            setOpen(false)
            return
        }

        setLoading(true)
        const previous = status
        setStatus(newStatus)
        setOpen(false)

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) {
                setStatus(previous)
            }
        } catch {
            setStatus(previous)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                disabled={loading}
                className="disabled:opacity-50"
            >
                <StatusBadge status={status} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 z-10 bg-background border rounded-lg shadow-sm py-1 min-w-36">
                    {ALL_STATUSES.map((s) => (
                        <button
                            key={s}
                            onClick={() => handleChange(s)}
                            className={`w-full text-left px-3 py-1.5 hover:bg-muted transition-colors ${
                                s === status ? "opacity-50 cursor-default" : ""
                            }`}
                        >
                            <StatusBadge status={s} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}