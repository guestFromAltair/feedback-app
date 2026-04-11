"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"

type Props = {
    postId: string
    postTitle: string
    onDelete?: () => void
}

export default function DeletePostButton({postId, postTitle, onDelete}: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!confirm(`Delete "${postTitle}"? This will also delete all votes and comments.`)) return

        setLoading(true)

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: "DELETE"
            })

            if (!res.ok) return

            if (onDelete) {
                onDelete()
            } else {
                router.back()
            }

            router.refresh()
        } catch {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
        >
            {loading ? "Deleting..." : "Delete"}
        </button>
    )
}