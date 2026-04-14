"use client"

import { useState, useTransition } from "react"
import { PostStatus } from "@prisma/client"
import PostCard from "./PostCard"

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
    hasVoted: boolean
    author: Author | null
    _count: { votes: number; comments: number }
    votes: { id: string }[]
}

type Props = {
    initialPosts: Post[]
    boardId: string
    isAdmin: boolean
    currentUserId: string
    orgSlug: string
    boardSlug: string
    totalCount: number
    hasMore: boolean
    lastCursor: string | null
}

type FilterStatus = "ALL" | PostStatus

const FILTERS: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "ALL" },
    { label: "Under review", value: "UNDER_REVIEW" },
    { label: "Planned", value: "PLANNED" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Done", value: "DONE" }
]

export default function AdminPostList({
                                          initialPosts,
                                          boardId,
                                          isAdmin,
                                          currentUserId,
                                          orgSlug,
                                          boardSlug,
                                          totalCount,
                                          hasMore: initialHasMore,
                                          lastCursor: initialCursor
                                      }: Props) {
    const [posts, setPosts] = useState<Post[]>(initialPosts)
    const [cursor, setCursor] = useState<string | null>(initialCursor)
    const [hasMore, setHasMore] = useState(initialHasMore)
    const [filter, setFilter] = useState<FilterStatus>("ALL")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function fetchPosts(newFilter: FilterStatus, newCursor: string | null, append: boolean) {
        setError(null)

        const params = new URLSearchParams()
        params.set("admin", "true")
        if (newCursor) params.set("cursor", newCursor)
        if (newFilter !== "ALL") params.set("filter", newFilter)

        try {
            const res = await fetch(`/api/boards/${boardId}/posts/paginated?${params.toString()}`)

            if (!res.ok) throw new Error("Failed to fetch posts")

            const data = await res.json()

            setPosts((prev) => append ? [...prev, ...data.posts] : data.posts)
            setCursor(data.nextCursor)
            setHasMore(data.nextCursor !== null)
        } catch {
            setError("Failed to load posts. Please try again.")
        }
    }

    function handleFilterChange(newFilter: FilterStatus) {
        if (newFilter === filter) return
        setFilter(newFilter)
        startTransition(() => {
            fetchPosts(newFilter, null, false)
        })
    }

    function handleLoadMore() {
        startTransition(() => {
            fetchPosts(filter, cursor, true)
        })
    }

    return (
        <div>
            <p className="text-sm text-muted-foreground mb-4">
                {totalCount} {totalCount === 1 ? "post" : "posts"}
            </p>

            <div className="flex gap-1 mb-6 flex-wrap">
                {FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => handleFilterChange(f.value)}
                        disabled={isPending}
                        className={`text-sm px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
                            filter === f.value
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {posts.length === 0 && !isPending ? (
                <div className="border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        No posts in this category yet
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            isAdmin={isAdmin}
                            hasVoted={post.hasVoted}
                            currentUserId={currentUserId}
                            orgSlug={orgSlug}
                            boardSlug={boardSlug}
                        />
                    ))}

                    {isPending && (
                        <>
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex gap-4 p-4 border rounded-xl animate-pulse"
                                >
                                    <div className="flex flex-col items-center gap-1 w-10">
                                        <div className="h-8 w-8 rounded-lg bg-muted" />
                                        <div className="h-4 w-6 bg-muted rounded" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-muted rounded" />
                                        <div className="h-3 w-full bg-muted rounded" />
                                        <div className="h-3 w-1/3 bg-muted rounded" />
                                        <div className="flex gap-2 mt-1">
                                            <div className="h-5 w-20 bg-muted rounded-full" />
                                            <div className="h-5 w-32 bg-muted rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {hasMore && !isPending && (
                <div className="mt-6 text-center">
                    <button
                        onClick={handleLoadMore}
                        className="border rounded-lg px-6 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                        Load more posts
                    </button>
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <p className="text-center text-xs text-muted-foreground mt-8">
                    You&#39;ve seen all {posts.length} posts
                </p>
            )}
        </div>
    )
}