import {NextResponse} from "next/server"
import {prisma} from "@/lib/db"
import {z} from "zod"
import {headers} from "next/headers";
import {publicPostRateLimit} from "@/lib/ratelimit";

const publicPostSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    body: z.string().max(2000).optional(),
    name: z.string().min(1, "Name is required").max(100),
    email: z.email("Invalid email")
})

export async function POST(req: Request, {params}: { params: Promise<{ boardId: string }> }) {
    const {boardId} = await params

    const headersList = await headers()
    const ip =
        headersList.get("x-forwarded-for")?.split(",")[0] ??
        headersList.get("x-real-ip") ??
        "anonymous"

    const {success, limit, remaining, reset} = await publicPostRateLimit.limit(ip)
    if (!success) {
        return NextResponse.json(
            {
                error: "You've submitted too many posts. Please wait before trying again."
            },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString()
                }
            }
        )
    }

    try {
        const board = await prisma.board.findUnique({
            where: {id: boardId},
        })

        if (!board || !board.isPublic) {
            return NextResponse.json(
                {error: "Board not found"},
                {status: 404}
            )
        }

        const body = await req.json()
        const parsed = publicPostSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                {error: parsed.error.issues[0].message},
                {status: 400}
            )
        }

        const {title, body: postBody, name, email} = parsed.data

        let user = await prisma.user.findUnique({
            where: {email}
        })

        if (!user) {
            user = await prisma.user.create({
                data: {email, name}
            })
        }

        const post = await prisma.post.create({
            data: {
                title,
                body: postBody,
                boardId,
                authorId: user.id
            }
        })

        return NextResponse.json(post, {status: 201})
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {error: "Something went wrong"},
            {status: 500}
        )
    }
}