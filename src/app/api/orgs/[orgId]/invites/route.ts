import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { nanoid } from "nanoid"

const inviteSchema = z.object({
    email: z.email(),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
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

        // Check if user is already a member
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

            // If they already have an account then we add them directly
            await prisma.membership.create({
                data: {
                    userId: existingUser.id,
                    orgId,
                    role
                }
            })

            return NextResponse.json({ message: "Member added successfully" })
        }

        // Generate a secure invite token
        const token = nanoid(32)
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        // Store the invite token in the VerificationToken table
        await prisma.verificationToken.create({
            data: {
                identifier: `invite:${orgId}:${role}:${email}`,
                token,
                expires
            }
        })

        const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`

        // We log it to the console for testing
        console.log(`
      ---- INVITE EMAIL ----
      To: ${email}
      Subject: You've been invited to ${org.name} on FeedbackApp
      
      ${session.user.name} has invited you to join ${org.name}.
      Click the link below to accept:
      
      ${inviteUrl}
      
      This link expires in 7 days.
      ----------------------
    `)

        return NextResponse.json({
            message: `Invite sent to ${email}`,
            // Return the URL for testing
            ...(process.env.NODE_ENV === "development" && { inviteUrl })
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}