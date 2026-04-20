import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const vote = await prisma.vote.create({
            data: {
                postId,
                userId: session.user.id
            }
        })

        return NextResponse.json(vote, { status: 201 })
    } catch (error: unknown) {
        // Unique constraint violation — already voted
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code: string }).code === "P2002"
        ) {
            return NextResponse.json(
                { error: "Already voted" },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        await prisma.vote.delete({
            where: {
                postId_userId: {
                    postId,
                    userId: session.user.id
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}