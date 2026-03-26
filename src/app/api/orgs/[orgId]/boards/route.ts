import {NextResponse} from "next/server"
import {auth} from "@/auth"
import {prisma} from "@/lib/db"
import {z} from "zod"

const createBoardSchema = z.object({
    name: z.string().min(1).max(50),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
    isPublic: z.boolean().default(true),
})

export async function GET(req: Request, {params}: { params: Promise<{ orgId: string }> }) {
    const {orgId} = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const membership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: session.user.id,
                orgId,
            },
        },
    })

    if (!membership) {
        return NextResponse.json({error: "Forbidden"}, {status: 403})
    }

    const boards = await prisma.board.findMany({
        where: {orgId},
        orderBy: {createdAt: "asc"},
    })

    return NextResponse.json(boards)
}

export async function POST(req: Request, {params}: { params: Promise<{ orgId: string }> }) {
    const {orgId} = await params
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const membership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: session.user.id,
                orgId,
            },
        },
    })

    if (!membership || membership.role !== "ADMIN") {
        return NextResponse.json({error: "Forbidden"}, {status: 403})
    }

    try {
        const body = await req.json()
        const parsed = createBoardSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                {error: parsed.error.issues[0].message},
                {status: 400}
            )
        }

        const {name, slug, isPublic} = parsed.data

        const existing = await prisma.board.findUnique({
            where: {
                orgId_slug: {
                    orgId,
                    slug,
                },
            },
        })

        if (existing) {
            return NextResponse.json(
                {error: "A board with this name already exists"},
                {status: 409}
            )
        }

        const board = await prisma.board.create({
            data: {
                name,
                slug,
                isPublic,
                orgId,
            },
        })

        return NextResponse.json(board, {status: 201})
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        )
    }
}