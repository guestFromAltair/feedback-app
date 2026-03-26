import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import PostList from "@/components/posts/PostList"
import NewPostButton from "@/components/posts/NewPostButton"

export default async function AdminBoardPage({params}: { params: Promise<{ org: string; board: string }> }) {
    const { org: orgSlug, board: boardSlug } = await params

    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const org = await prisma.organization.findUnique({
        where: { slug: orgSlug }
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

    const posts = await prisma.post.findMany({
        where: { boardId: board.id },
        include: {
            author: {
                select: { id: true, name: true, email: true }
            },
            _count: {
                select: { votes: true, comments: true }
            },
            votes: {
                where: { userId: session.user.id },
                select: { id: true }
            }
        },
        orderBy: { createdAt: "desc" },
    })

    const isAdmin = membership.role === "ADMIN"

    return (
        <div className="p-8 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link href={`/dashboard/${orgSlug}`} className="hover:underline">
                            {org.name}
                        </Link>
                        <span>/</span>
                        <span>{board.name}</span>
                    </div>
                    <h1 className="text-2xl font-medium">{board.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {board.isPublic && (
                        <Link
                            href={`/${orgSlug}/${boardSlug}`}
                            target="_blank"
                            className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                        >
                            View public board →
                        </Link>
                    )}
                    {isAdmin && <NewPostButton boardId={board.id} />}
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
            <PostList
                posts={posts}
                isAdmin={isAdmin}
                currentUserId={session.user.id}
                orgSlug={orgSlug}
                boardSlug={boardSlug}
            />
        </div>
    )
}