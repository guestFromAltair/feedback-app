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
    author: Author | null
    _count: { votes: number; comments: number }
    votes: { id: string }[]
}

type Props = {
    posts: Post[]
    isAdmin: boolean
    currentUserId: string
    orgSlug: string
    boardSlug: string
}

const STATUS_ORDER: PostStatus[] = [
    "UNDER_REVIEW",
    "PLANNED",
    "IN_PROGRESS",
    "DONE",
]

export default function PostList({
                                     posts,
                                     isAdmin,
                                     currentUserId,
                                     orgSlug,
                                     boardSlug,
                                 }: Props) {
    if (posts.length === 0) {
        return (
            <div className="border rounded-xl p-12 text-center">
                <p className="text-muted-foreground text-sm">
                    No posts yet. Be the first to submit feedback.
                </p>
            </div>
        )
    }

    const sorted = [...posts].sort(
        (a, b) => b._count.votes - a._count.votes
    )

    return (
        <div className="space-y-3">
            {sorted.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    isAdmin={isAdmin}
                    hasVoted={post.votes.length > 0}
                    currentUserId={currentUserId}
                    orgSlug={orgSlug}
                    boardSlug={boardSlug}
                />
            ))}
        </div>
    )
}