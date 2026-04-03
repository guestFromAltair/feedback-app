import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const invite = await prisma.verificationToken.findUnique({
            where: { token }
        })

        if (!invite || invite.expires < new Date()) {
            return NextResponse.json(
                { error: "Invite link has expired or is invalid" },
                { status: 410 }
            )
        }

        const [, orgId, role] = invite.identifier.split(":")

        await prisma.membership.upsert({
            where: {
                userId_orgId: {
                    userId: session.user.id,
                    orgId
                }
            },
            create: {
                userId: session.user.id,
                orgId,
                role: role as "ADMIN" | "MEMBER"
            },
            update: {}
        })

        await prisma.verificationToken.deleteMany({
            where: { token }
        })

        const org = await prisma.organization.findUnique({
            where: { id: orgId }
        })

        return NextResponse.json({ orgSlug: org?.slug })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}