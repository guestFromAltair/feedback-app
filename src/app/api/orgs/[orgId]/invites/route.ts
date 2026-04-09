import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { nanoid } from "nanoid"
import {sendInviteEmail} from "@/lib/email";

const inviteSchema = z.object({
    email: z.email(),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
})

export async function POST(
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

    if (!membership || membership.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const body = await req.json()
        const parsed = inviteSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { email, role } = parsed.data

        const org = await prisma.organization.findUnique({
            where: { id: orgId }
        })

        if (!org) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            const existingMembership = await prisma.membership.findUnique({
                where: {
                    userId_orgId: {
                        userId: existingUser.id,
                        orgId
                    }
                }
            })

            if (existingMembership) {
                return NextResponse.json(
                    { error: "This person is already a member" },
                    { status: 409 }
                )
            }

            await prisma.membership.create({
                data: {
                    userId: existingUser.id,
                    orgId,
                    role
                }
            })

            try {
                await sendInviteEmail({
                    to: email,
                    inviterName: session.user.name ?? "FeedbackApp Team",
                    orgName: org.name,
                    inviteUrl: `${process.env.NEXTAUTH_URL}/dashboard/${org.slug}`
                })
            } catch (emailError) {
                // We don't fail the request if email fails
                console.error("Failed to send notification email:", emailError)
            }

            return NextResponse.json({ message: "Member added successfully" })
        }

        const token = nanoid(32)
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await prisma.verificationToken.create({
            data: {
                identifier: `invite:${orgId}:${role}:${email}`,
                token,
                expires
            }
        })

        const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`
        try {
            await sendInviteEmail({
                to: email,
                inviterName: session.user.name ?? "Someone",
                orgName: org.name,
                inviteUrl
            })
        } catch (emailError) {
            await prisma.verificationToken.delete({ where: { token } })
            console.error("Failed to send invite email:", emailError)
            return NextResponse.json(
                { error: "Failed to send invite email. Please try again." },
                { status: 500 }
            )
        }

        return NextResponse.json({message: `Invite sent to ${email}`})
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}