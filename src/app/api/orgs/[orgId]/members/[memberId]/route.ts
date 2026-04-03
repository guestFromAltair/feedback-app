import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateMemberSchema = z.object({
    role: z.enum(["ADMIN", "MEMBER"])
})

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
    const { orgId, memberId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requesterMembership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: session.user.id,
                orgId
            }
        }
    })

    if (!requesterMembership || requesterMembership.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const body = await req.json()
        const parsed = updateMemberSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const org = await prisma.organization.findUnique({
            where: { id: orgId }
        })

        const targetMembership = await prisma.membership.findUnique({
            where: { id: memberId }
        })

        if (!targetMembership) {
            return NextResponse.json(
                { error: "Member not found" },
                { status: 404 }
            )
        }

        if (targetMembership.userId === org?.ownerId) {
            return NextResponse.json(
                { error: "Cannot change the owner's role" },
                { status: 403 }
            )
        }

        const updated = await prisma.membership.update({
            where: { id: memberId },
            data: { role: parsed.data.role }
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
    { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
    const { orgId, memberId } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requesterMembership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: session.user.id,
                orgId
            }
        }
    })

    if (!requesterMembership || requesterMembership.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const org = await prisma.organization.findUnique({
            where: { id: orgId },
        })

        const targetMembership = await prisma.membership.findUnique({
            where: { id: memberId },
        })

        if (!targetMembership) {
            return NextResponse.json(
                { error: "Member not found" },
                { status: 404 }
            )
        }

        if (targetMembership.userId === org?.ownerId) {
            return NextResponse.json(
                { error: "Cannot remove the workspace owner" },
                { status: 403 }
            )
        }

        await prisma.membership.delete({
            where: { id: memberId }
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