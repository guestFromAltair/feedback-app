import {notFound} from "next/navigation"
import {prisma} from "@/lib/db"
import {auth} from "@/auth"
import SubmitPostForm from "@/components/posts/SubmitPostForm"
import PaginatedPostList from "@/components/posts/PaginatedPostList";

const POSTS_PER_PAGE = 10

export async function generateMetadata({params}: { params: Promise<{ org: string; board: string }> }) {
    const {org: orgSlug, board: boardSlug} = await params

    const board = await prisma.board.findFirst({
        where: {
            slug: boardSlug,
            org: {slug: orgSlug},
            isPublic: true
        },
        include: {org: true}
    })

    if (!board) return {title: "Not found"}

    return {
        title: `${board.name} — ${board.org.name}`,
        description: `Vote on what ${board.org.name} should build next`
    }
}

export default async function PublicBoardPage({params}: { params: Promise<{ org: string; board: string }> }) {
    const {org: orgSlug, board: boardSlug} = await params

    const session = await auth()

    const board = await prisma.board.findFirst({
        where: {
            slug: boardSlug,
            org: {slug: orgSlug},
            isPublic: true
        },
        include: {org: true}
    })

    if (!board) notFound()

    const posts = await prisma.post.findMany({
        where: {boardId: board.id},
        include: {
            _count: {
                select: {votes: true, comments: true}
            },
            votes: session?.user?.id ? {where: {userId: session.user.id}, select: {id: true}} : false
        },
        orderBy: [
            {votes: {_count: "desc"}},
            {createdAt: "desc"}
        ],
        take: POSTS_PER_PAGE
    })

    const totalCount = await prisma.post.count({
        where: { boardId: board.id }
    })

    const hasMore = totalCount > POSTS_PER_PAGE
    const lastPost = posts[posts.length - 1]

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-1">
                    {board.org.name}
                </p>
                <h1 className="text-3xl font-medium mb-2">{board.name}</h1>
                <p className="text-muted-foreground">
                    Vote on what we should build next
                </p>
            </div>

            <div className="mb-8">
                <SubmitPostForm boardId={board.id}/>
            </div>

            <PaginatedPostList
                initialPosts={posts.map((p) => ({
                    ...p,
                    hasVoted: Array.isArray(p.votes) && p.votes.length > 0
                }))}
                boardId={board.id}
                currentUserId={session?.user?.id ?? null}
                totalCount={totalCount}
                hasMore={hasMore}
                lastCursor={lastPost?.id ?? null}
            />
        </div>
    )
}