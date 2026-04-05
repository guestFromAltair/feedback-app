import {auth} from "@/auth"
import {redirect, notFound} from "next/navigation"
import {prisma} from "@/lib/db"
import Link from "next/link"
import NewBoardButton from "@/components/boards/NewBoardButton"

export default async function OrgPage({params}: { params: Promise<{ org: string }> }) {
    const {org: orgSlug} = await params

    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const org = await prisma.organization.findUnique({
        where: {slug: orgSlug},
    })

    if (!org) notFound()

    const membership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: session.user.id,
                orgId: org.id,
            },
        },
    })

    if (!membership) notFound()

    const boards = await prisma.board.findMany({
        where: {orgId: org.id},
        include: {
            _count: {select: {posts: true}}
        },
        orderBy: {createdAt: "asc"}
    })

    const isAdmin = membership.role === "ADMIN"

    return (
        <div className="p-4 md:p-8 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {org.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        feedbacker.app/{org.slug}
                    </p>
                </div>
                <div className="w-full md:w-auto flex justify-start md:justify-end">
                    <NewBoardButton orgId={org.id} />
                </div>
            </div>

            {boards.length === 0 ? (
                <div className="border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground text-sm mb-4">
                        No boards yet — create your first one
                    </p>
                    {isAdmin && <NewBoardButton orgId={org.id}/>}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {boards.map((board) => (
                        <Link
                            key={board.id}
                            href={`/dashboard/${orgSlug}/${board.slug}`}
                            className="border rounded-xl p-5 hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">
                                    💬
                                </div>
                                <span className={`text-xs border rounded-full px-2 py-0.5 ${
                                    board.isPublic
                                        ? "text-green-700 border-green-200 bg-green-50"
                                        : "text-muted-foreground"
                                }`}>
                                  {board.isPublic ? "Public" : "Private"}
                                </span>
                            </div>
                            <p className="font-medium text-sm">{board.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {board._count.posts}{" "}
                                {board._count.posts === 1 ? "post" : "posts"}
                            </p>
                            {board.isPublic && (
                                <p className="text-xs text-blue-600 mt-2">
                                    /{orgSlug}/{board.slug}
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}