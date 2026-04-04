import {NextResponse} from "next/server"
import {auth} from "@/auth"
import {prisma} from "@/lib/db"
import {z} from "zod"

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

export async function PATCH(req: Request, {params}: { params: Promise<{ orgId: string }> }) {
    const {orgId} = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
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
        return NextResponse.json({error: "Forbidden"}, {status: 403})
    }

    try {
        const body = await req.json()
        const parsed = updateOrgSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                {error: parsed.error.issues[0].message},
                {status: 400}
            )
        }

        const {name, slug} = parsed.data

        const existing = await prisma.organization.findUnique({
            where: {slug}
        })

        if (existing && existing.id !== orgId) {
            return NextResponse.json(
                {error: "This workspace URL is already taken"},
                {status: 409}
            )
        }

        const updated = await prisma.organization.update({
            where: {id: orgId},
            data: {name, slug}
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        )
    }
}

export async function DELETE(
    req: Request,
    {params}: { params: Promise<{ orgId: string }> }
) {
    const {orgId} = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const org = await prisma.organization.findUnique({
        where: {id: orgId}
    })

    if (!org) {
        return NextResponse.json(
            {error: "Organization not found"},
            {status: 404}
        )
    }

    if (org.ownerId !== session.user.id) {
        return NextResponse.json({error: "Forbidden"}, {status: 403})
    }

    try {
        await prisma.organization.delete({
            where: {id: orgId}
        })

        return NextResponse.json({success: true})
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        )
    }
}