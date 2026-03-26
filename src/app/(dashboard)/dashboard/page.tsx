import {auth} from "@/auth"
import {redirect} from "next/navigation"
import {prisma} from "@/lib/db"
import Link from "next/link"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.id) redirect("/login")

    const memberships = await prisma.membership.findMany({
        where: {userId: session.user.id},
        include: {
            org: {
                include: {
                    _count: {select: {boards: true}},
                },
            },
        },
        orderBy: {joinedAt: "asc"}
    })

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-medium">
                        Welcome back, {session.user.name?.split(" ")[0]}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Your workspaces
                    </p>
                </div>
                <Link
                    href="/dashboard/new"
                    className="text-sm border rounded-lg px-4 py-2 hover:bg-muted transition-colors"
                >
                    New workspace
                </Link>
            </div>

            {memberships.length === 0 ? (
                <div className="border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground text-sm mb-4">
                        You don&#39;t have any workspaces yet
                    </p>
                    <Link
                        href="/dashboard/new"
                        className="text-sm bg-black text-white rounded-lg px-4 py-2"
                    >
                        Create your first workspace
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {memberships.map(({org, role}) => (
                        <Link
                            key={org.id}
                            href={`/dashboard/${org.slug}`}
                            className="border rounded-xl p-5 hover:bg-muted/30 transition-colors group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                                    {org.name[0].toUpperCase()}
                                </div>
                                <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">
                                    {role.toLowerCase()}
                                </span>
                            </div>
                            <p className="font-medium text-sm">{org.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {org._count.boards}{" "}
                                {org._count.boards === 1 ? "board" : "boards"}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}