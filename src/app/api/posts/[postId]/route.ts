import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateStatusSchema = z.object({
    status: z.enum(["UNDER_REVIEW", "PLANNED", "IN_PROGRESS", "DONE"])
})

const updatePostSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    body: z.string().max(2000).optional().nullable()
})

async function getPostWithMembership(
    postId: string,
    userId: string
) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            board: {
                include: { org: true }
            }
        }
    })

    if (!post) return { post: null, membership: null }

    const membership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId,
                orgId: post.board.orgId
            }
        }
    })

    return { post, membership }
}

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
        const parsed = updateStatusSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { post, membership } = await getPostWithMembership(
            postId,
            session.user.id
        )

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            )
        }

        if (!membership || membership.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updated = await prisma.post.update({
            where: { id: postId },
            data: { status: parsed.data.status }
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

export async function PUT(
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

        const { post, membership } = await getPostWithMembership(
            postId,
            session.user.id
        )

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            )
        }

        const isAuthor = post.authorId === session.user.id
        const isAdmin = membership?.role === "ADMIN"

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updated = await prisma.post.update({
            where: { id: postId },
            data: {
                title: parsed.data.title,
                body: parsed.data.body
            }
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

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { post, membership } = await getPostWithMembership(
            postId,
            session.user.id
        )

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            )
        }

        const isAuthor = post.authorId === session.user.id
        const isAdmin = membership?.role === "ADMIN"

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.post.delete({
            where: { id: postId }
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