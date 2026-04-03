import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ commentId: string }> }
) {
    const { commentId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                post: {
                    include: {
                        board: {
                            include: {
                                org: {
                                    include: {
                                        memberships: {
                                            where: { userId: session.user.id },
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!comment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            )
        }

        const membership = comment.post.board.org.memberships[0]
        const isAdmin = membership?.role === "ADMIN"
        const isAuthor = comment.authorId === session.user.id

        if (!isAdmin && !isAuthor) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.comment.delete({
            where: { id: commentId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}