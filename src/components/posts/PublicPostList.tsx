"use client"

import { useState } from "react"
import { PostStatus } from "@prisma/client"
import PublicPostCard from "./PublicPostCard"

type Post = {
    id: string
    title: string
    body: string | null
    status: PostStatus
    createdAt: Date
    hasVoted: boolean
    _count: { votes: number; comments: number }
}

type Props = {
    posts: Post[]
    currentUserId: string | null
}

type FilterStatus = "ALL" | PostStatus

const FILTERS: { label: string; value: FilterStatus }[] = [
    { label: "Most voted", value: "ALL" },
    { label: "Under review", value: "UNDER_REVIEW" },
    { label: "Planned", value: "PLANNED" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Done", value: "DONE" },
]

export default function PublicPostList({ posts, currentUserId }: Props) {
    const [filter, setFilter] = useState<FilterStatus>("ALL")

    const filtered = filter === "ALL"
        ? posts
        : posts.filter((p) => p.status === filter)

    return (
        <div>
            <div className="flex gap-1 mb-6 flex-wrap">
                {FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                            filter === f.value
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-sm">
                        No posts in this category yet
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((post) => (
                        <PublicPostCard
                            key={post.id}
                            post={post}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}