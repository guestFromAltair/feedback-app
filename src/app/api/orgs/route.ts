import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createOrgSchema = z.object({
    name: z.string().min(1, "Name is required").max(50),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, {
        message: "Slug can only contain lowercase letters, numbers and hyphens"
    })
})

const updateOrgSchema = z.object({
    name: z.string().min(1).max(50),
    slug: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[a-z0-9-]+$/, {
            message:
                "Slug can only contain lowercase letters, numbers and hyphens"
        })
})

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const memberships = await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: { org: true },
    })

    return NextResponse.json(memberships.map((m) => m.org))
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const parsed = createOrgSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { name, slug } = parsed.data

        const existing = await prisma.organization.findUnique({
            where: { slug },
        })

        if (existing) {
            return NextResponse.json(
                { error: "This workspace URL is already taken" },
                { status: 409 }
            )
        }

        const org = await prisma.organization.create({
            data: {
                name,
                slug,
                ownerId: session.user.id,
                memberships: {
                    create: {
                        userId: session.user.id,
                        role: "ADMIN",
                    },
                },
            },
        })

        return NextResponse.json(org, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}