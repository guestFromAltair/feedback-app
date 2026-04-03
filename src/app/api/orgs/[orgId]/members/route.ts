import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ orgId: string }> }
) {
    const { orgId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const membership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: session.user.id,
                orgId
            }
        }
    })

    if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const members = await prisma.membership.findMany({
        where: { orgId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: { joinedAt: "asc" }
    })

    return NextResponse.json(members)
}