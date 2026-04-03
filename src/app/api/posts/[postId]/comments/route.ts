import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createCommentSchema = z.object({
    body: z.string().min(1, "Comment cannot be empty").max(1000),
})

export async function GET(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params

    const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
            author: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(comments)
}

export async function POST(
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
        const parsed = createCommentSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const comment = await prisma.comment.create({
            data: {
                body: parsed.data.body,
                postId,
                authorId: session.user.id
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        return NextResponse.json(comment, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}