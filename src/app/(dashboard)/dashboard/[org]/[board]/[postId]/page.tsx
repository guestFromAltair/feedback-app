import {auth} from "@/auth"
import {redirect, notFound} from "next/navigation"
import {prisma} from "@/lib/db"
import Link from "next/link"
import StatusBadge from "@/components/posts/StatusBadge"
import StatusSelect from "@/components/posts/StatusSelect"
import CommentList from "@/components/comments/CommentList"
import CommentForm from "@/components/comments/CommentForm"

export default async function AdminPostPage({params}: {
    params: Promise<{ org: string; board: string; postId: string }>
}) {
    const {org: orgSlug, board: boardSlug, postId} = await params

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
            },
        },
    })

    if (!membership) notFound()

    const post = await prisma.post.findUnique({
        where: {id: postId},
        include: {
            author: {
                select: {id: true, name: true, email: true}
            },
            board: true,
            _count: {
                select: {votes: true, comments: true}
            },
            votes: {
                where: {userId: session.user.id},
                select: {id: true}
            },
            comments: {
                include: {
                    author: {
                        select: {id: true, name: true, email: true}
                    }
                },
                orderBy: {createdAt: "asc"}
            }
        }
    })

    if (!post || post.board.orgId !== org.id) notFound()

    const isAdmin = membership.role === "ADMIN"
    const hasVoted = post.votes.length > 0

    return (
        <div className="p-8 max-w-2xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link
                    href={`/dashboard/${orgSlug}`}
                    className="hover:underline"
                >
                    {org.name}
                </Link>
                <span>/</span>
                <Link
                    href={`/dashboard/${orgSlug}/${boardSlug}`}
                    className="hover:underline"
                >
                    {post.board.name}
                </Link>
                <span>/</span>
                <span className="text-foreground truncate max-w-48">
                  {post.title}
                </span>
            </div>
            <div className="border rounded-xl p-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0 w-10">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs ${
                            hasVoted
                                ? "bg-purple-50 border-purple-300 text-purple-700"
                                : "border-border text-muted-foreground"
                        }`}>
                            ▲
                        </div>
                        <span className={`text-sm font-medium ${
                            hasVoted ? "text-purple-700" : ""
                        }`}>
                          {post._count.votes}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-medium mb-2">{post.title}</h1>
                        {post.body && (
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                {post.body}
                            </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                            {isAdmin ? (
                                <StatusSelect
                                    postId={post.id}
                                    currentStatus={post.status}
                                />
                            ) : (
                                <StatusBadge status={post.status}/>
                            )}

                            {post.author && (
                                <span className="text-xs text-muted-foreground">
                                  by {post.author.name ?? post.author.email}
                                </span>
                            )}

                            <span className="text-xs text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-sm font-medium mb-4">
                    {post._count.comments}{" "}
                    {post._count.comments === 1 ? "comment" : "comments"}
                </h2>

                <CommentList
                    comments={post.comments}
                    currentUserId={session.user.id}
                    isAdmin={isAdmin}
                />

                <div className="mt-6">
                    <CommentForm
                        postId={post.id}
                        userName={session.user.name ?? ""}
                    />
                </div>
            </div>

        </div>
    )
}