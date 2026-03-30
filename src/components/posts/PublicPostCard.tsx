"use client"

import { useState } from "react"
import { PostStatus } from "@prisma/client"
import StatusBadge from "./StatusBadge"

type Post = {
    id: string
    title: string
    body: string | null
    status: PostStatus
    hasVoted: boolean
    _count: { votes: number; comments: number }
}

type Props = {
    post: Post
    currentUserId: string | null
}

export default function PublicPostCard({ post, currentUserId }: Props) {
    const [voted, setVoted] = useState(post.hasVoted)
    const [voteCount, setVoteCount] = useState(post._count.votes)
    const [voting, setVoting] = useState(false)

    async function handleVote() {
        if (voting) return

        if (!currentUserId) {
            window.location.href = "/login"
            return
        }

        const originalVoted = voted
        const originalCount = voteCount

        setVoting(true)
        setVoted(!originalVoted)
        setVoteCount(prev => originalVoted ? prev - 1 : prev + 1)

        try {
            const res = await fetch(`/api/posts/${post.id}/votes`, {
                method: originalVoted ? "DELETE" : "POST",
            })

            if (!res.ok) throw new Error("Failed to vote")

        } catch {
            setVoted(originalVoted)
            setVoteCount(originalCount)
        } finally {
            setVoting(false)
        }
    }

    return (
        <div className="flex gap-4 p-4 border rounded-xl hover:bg-muted/20 transition-colors">
            <div className="flex flex-col items-center gap-1 shrink-0 w-10">
                <button
                    onClick={handleVote}
                    disabled={voting}
                    title={currentUserId ? undefined : "Sign in to vote"}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs transition-colors ${
                        voted
                            ? "bg-purple-50 border-purple-300 text-purple-700"
                            : "hover:bg-muted border-border text-muted-foreground"
                    }`}
                >
                    ▲
                </button>
                <span className={`text-sm font-medium ${
                    voted ? "text-purple-700" : "text-foreground"
                }`}>
                  {voteCount}
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{post.title}</p>

                {post.body && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {post.body}
                    </p>
                )}

                <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={post.status} />
                    <span className="text-xs text-muted-foreground">
                    💬 {post._count.comments}
                    </span>
                </div>
            </div>
        </div>
    )
}