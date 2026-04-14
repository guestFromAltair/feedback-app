import {auth} from "@/auth"
import {redirect, notFound} from "next/navigation"
import {prisma} from "@/lib/db"
import Link from "next/link"
import NewPostButton from "@/components/posts/NewPostButton"
import AdminPostList from "@/components/posts/AdminPostList";

const POSTS_PER_PAGE = 10

export default async function AdminBoardPage({params}: { params: Promise<{ org: string; board: string }> }) {
    const {org: orgSlug, board: boardSlug} = await params

    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const org = await prisma.organization.findUnique({
        where: {slug: orgSlug}
    })

    if (!org) notFound()

    const membership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: session.user.id,
                orgId: org.id
            }
        }
    })

    if (!membership) notFound()

    const board = await prisma.board.findUnique({
        where: {
            orgId_slug: {
                orgId: org.id,
                slug: boardSlug
            }
        }
    })

    if (!board) notFound()

    const isAdmin = membership.role === "ADMIN"

    const posts = await prisma.post.findMany({
        where: {boardId: board.id},
        include: {
            author: {
                select: {id: true, name: true, email: true}
            },
            _count: {
                select: {votes: true, comments: true}
            },
            votes: {
                where: {userId: session.user.id},
                select: {id: true}
            }
        },
        orderBy: [
            {votes: {_count: "desc"}},
            {createdAt: "desc"}
        ],
        take: POSTS_PER_PAGE
    })

    const totalCount = await prisma.post.count({where: {boardId: board.id}})

    const hasMore = totalCount > POSTS_PER_PAGE
    const lastPost = posts[posts.length - 1]

    return (
        <div className="p-4 md:p-8 max-w-3xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link href={`/dashboard/${orgSlug}`} className="hover:underline">
                            {org.name}
                        </Link>
                        <span>/</span>
                        <span className="truncate">{board.name}</span>
                    </div>
                    <h1 className="text-2xl font-medium">{board.name}</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {board.isPublic && (
                        <Link
                            href={`/${orgSlug}/${boardSlug}`}
                            target="_blank"
                            className="inline-flex items-center justify-center h-9 whitespace-nowrap text-xs text-blue-600 border border-blue-200 rounded-lg px-3 hover:bg-blue-50 transition-colors"
                        >
                            View public board →
                        </Link>
                    )}
                    {isAdmin && <NewPostButton boardId={board.id}/>}
                </div>
            </div>

            <AdminPostList
                initialPosts={posts.map((p) => ({
                    ...p,
                    hasVoted: p.votes.length > 0,
                }))}
                boardId={board.id}
                isAdmin={isAdmin}
                currentUserId={session.user.id}
                orgSlug={orgSlug}
                boardSlug={boardSlug}
                totalCount={totalCount}
                hasMore={hasMore}
                lastCursor={lastPost?.id ?? null}
            />
        </div>
    )
}