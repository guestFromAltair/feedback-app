import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createPostSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    body: z.string().max(2000).optional(),
})

export async function GET(
    req: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    const { boardId } = await params

    const posts = await prisma.post.findMany({
        where: { boardId },
        include: {
            author: {
                select: { id: true, name: true, email: true },
            },
            _count: {
                select: { votes: true, comments: true },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(posts)
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    const { boardId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const parsed = createPostSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const post = await prisma.post.create({
            data: {
                title: parsed.data.title,
                body: parsed.data.body,
                boardId,
                authorId: session.user.id,
            }
        })

        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}