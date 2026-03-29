import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updatePostSchema = z.object({
    status: z.enum(["UNDER_REVIEW", "PLANNED", "IN_PROGRESS", "DONE"]),
})

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const parsed = updatePostSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        // Verify the user is an admin of the org this post belongs to
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                board: {
                    include: { org: true },
                },
            },
        })

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        const membership = await prisma.membership.findUnique({
            where: {
                userId_orgId: {
                    userId: session.user.id,
                    orgId: post.board.orgId,
                },
            },
        })

        if (!membership || membership.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updated = await prisma.post.update({
            where: { id: postId },
            data: { status: parsed.data.status },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}