"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type Comment, type User } from "@prisma/client"

type CommentWithAuthor = Comment & {
    author: Pick<User, "id" | "name" | "email"> | null
}

type Props = {
    comment: CommentWithAuthor
    currentUserId: string
    isAdmin: boolean
}

export default function CommentItem({
                                        comment,
                                        currentUserId,
                                        isAdmin,
                                    }: Props) {
    const router = useRouter()
    const [deleting, setDeleting] = useState(false)

    const canDelete =
        isAdmin || comment.author?.id === currentUserId

    const displayName =
        comment.author?.name ?? comment.author?.email ?? "Anonymous"

    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    async function handleDelete() {
        if (!confirm("Delete this comment?")) return
        setDeleting(true)

        try {
            await fetch(`/api/comments/${comment.id}`, {
                method: "DELETE",
            })
            router.refresh()
        } catch {
            setDeleting(false)
        }
    }

    return (
        <div className={`flex gap-3 ${deleting ? "opacity-50" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{displayName}</span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </span>
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="text-xs text-muted-foreground hover:text-red-600 transition-colors ml-auto"
                            >
                                Delete
                            </button>
                        )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {comment.body}
                </p>
            </div>
        </div>
    )
}