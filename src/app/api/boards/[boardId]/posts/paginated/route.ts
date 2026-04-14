import {NextResponse} from "next/server"
import {auth} from "@/auth"
import {prisma} from "@/lib/db"
import {z} from "zod"

const POSTS_PER_PAGE = 10

const querySchema = z.object({
    cursor: z.string().optional(),
    filter: z
        .enum(["ALL", "UNDER_REVIEW", "PLANNED", "IN_PROGRESS", "DONE"])
        .default("ALL"),
    admin: z.enum(["true", "false"]).default("false")
})

export async function GET(req: Request, {params}: { params: Promise<{ boardId: string }> }) {
    const {boardId} = await params
    const session = await auth()

    const {searchParams} = new URL(req.url)
    const parsed = querySchema.safeParse({
        cursor: searchParams.get("cursor") ?? undefined,
        filter: searchParams.get("filter") ?? "ALL",
        admin: searchParams.get("admin") ?? "false"
    })

    if (!parsed.success) {
        return NextResponse.json({error: "Invalid query"}, {status: 400})
    }

    const {cursor, filter, admin} = parsed.data
    const isAdminRequest = admin === "true"

    try {
        const board = await prisma.board.findUnique({
            where: {id: boardId},
            include: {org: true}
        })

        if (!board) {
            return NextResponse.json(
                {error: "Board not found"},
                {status: 404}
            )
        }

        if (isAdminRequest) {
            if (!session?.user?.id) {
                return NextResponse.json(
                    {error: "Unauthorized"},
                    {status: 401}
                )
            }

            const membership = await prisma.membership.findUnique({
                where: {
                    userId_orgId: {
                        userId: session.user.id,
                        orgId: board.orgId
                    }
                }
            })

            if (!membership) {
                return NextResponse.json(
                    {error: "Forbidden"},
                    {status: 403}
                )
            }
        } else {
            if (!board.isPublic) {
                return NextResponse.json(
                    {error: "Board not found"},
                    {status: 404}
                )
            }
        }

        const where = {
            boardId,
            ...(filter !== "ALL" && {status: filter})
        }

        const posts = await prisma.post.findMany({
            where,
            include: {
                author: {
                    select: {id: true, name: true, email: true}
                },
                _count: {
                    select: {votes: true, comments: true}
                },
                votes: session?.user?.id
                    ? {
                        where: {userId: session.user.id},
                        select: {id: true},
                    }
                    : false
            },
            orderBy: [
                {votes: {_count: "desc"}},
                {createdAt: "desc"}
            ],
            ...(cursor && {
                cursor: {id: cursor},
                skip: 1
            }),
            take: POSTS_PER_PAGE
        })

        const totalCount = await prisma.post.count({where})
        const lastPost = posts[posts.length - 1]

        return NextResponse.json({
            posts: posts.map((p) => ({
                ...p,
                hasVoted: Array.isArray(p.votes) && p.votes.length > 0
            })),
            nextCursor: posts.length === POSTS_PER_PAGE
                ? lastPost?.id
                : null,
            totalCount
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        )
    }
}