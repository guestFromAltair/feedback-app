"use client"

import { useState } from "react"
import { PostStatus } from "@prisma/client"
import Link from "next/link"
import StatusBadge from "./StatusBadge"
import StatusSelect from "./StatusSelect"
import DeletePostButton from "@/components/posts/DeletePostButton";
import EditPostDialog from "@/components/posts/EditPostDialog";
import {useRouter} from "next/navigation";

type Author = {
    id: string
    name: string | null
    email: string | null
}

type Post = {
    id: string
    title: string
    body: string | null
    status: PostStatus
    createdAt: Date
    author: Author | null
    _count: { votes: number; comments: number }
}

type Props = {
    post: Post
    isAdmin: boolean
    hasVoted: boolean
    currentUserId: string
    orgSlug: string
    boardSlug: string
}

export default function PostCard({post, isAdmin, hasVoted, currentUserId, orgSlug, boardSlug}: Props) {
    const router = useRouter()
    const [voted, setVoted] = useState(hasVoted)
    const [voteCount, setVoteCount] = useState(post._count.votes)
    const [voting, setVoting] = useState(false)
    const [deleted, setDeleted] = useState(false)

    const isAuthor = post.author?.id === currentUserId
    const canEditOrDelete = isAdmin || isAuthor

    async function handleVote() {
        if (voting) return
        setVoting(true)

        const originalVoted = voted
        const originalCount = voteCount

        // Optimistic Update (Update the voted and voteCount in UI immediately)
        setVoted(!originalVoted)
        setVoteCount(prev => originalVoted ? prev - 1 : prev + 1)

        try {
            const res = await fetch(`/api/posts/${post.id}/votes`, {
                method: originalVoted ? "DELETE" : "POST"
            })

            if (!res.ok) throw new Error("Failed to vote")
            router.refresh()
        } catch {
            setVoted(originalVoted)
            setVoteCount(originalCount)
        } finally {
            setVoting(false)
        }
    }

    if (deleted) return null

    return (
        <div className="flex gap-4 p-4 border rounded-xl hover:bg-muted/20 transition-colors">
            <div className="flex flex-col items-center gap-1 shrink-0 w-10">
                <button
                    onClick={handleVote}
                    disabled={voting}
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
                <Link
                    href={`/dashboard/${orgSlug}/${boardSlug}/${post.id}`}
                    className="font-medium text-sm hover:underline line-clamp-1"
                >
                    {post.title}
                </Link>

                {post.body && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {post.body}
                    </p>
                )}

                <div className="flex items-center gap-3 mt-2 flex-wrap min-w-0">
                    {isAdmin ? (
                        <StatusSelect postId={post.id} currentStatus={post.status} />
                    ) : (
                        <StatusBadge status={post.status} />
                    )}

                    <div className="flex items-center gap-3 mt-2 flex-wrap min-w-0">
                        {post.author && (
                            <span className="text-xs text-muted-foreground truncate max-w-32">
                              {post.author.email}
                            </span>
                        )}
                    </div>

                    <span className="text-xs text-muted-foreground">
            💬           {post._count.comments}
                    </span>

                    {canEditOrDelete && (
                        <div className="flex items-center gap-2 ml-auto">
                            <EditPostDialog
                                postId={post.id}
                                currentTitle={post.title}
                                currentBody={post.body}
                            />
                            <DeletePostButton
                                postId={post.id}
                                postTitle={post.title}
                                onDelete={() => setDeleted(true)}
                            />
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}