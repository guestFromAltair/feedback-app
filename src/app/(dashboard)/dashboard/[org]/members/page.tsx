import {auth} from "@/auth"
import {redirect, notFound} from "next/navigation"
import {prisma} from "@/lib/db"
import MemberList from "@/components/members/MemberList"
import InviteForm from "@/components/members/InviteForm"

export default async function MembersPage({params}: {
    params: Promise<{ org: string }>
}) {
    const {org: orgSlug} = await params

    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const org = await prisma.organization.findUnique({
        where: {slug: orgSlug}
    })

    if (!org) notFound()

    const membership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: session.user.id,
                orgId: org.id
            }
        }
    })

    if (!membership) notFound()

    const members = await prisma.membership.findMany({
        where: {orgId: org.id},
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                }
            }
        },
        orderBy: {joinedAt: "asc"}
    })

    const isAdmin = membership.role === "ADMIN"

    return (
        <div className="p-8 max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-medium">Team members</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {members.length}{" "}
                        {members.length === 1 ? "member" : "members"} in {org.name}
                    </p>
                </div>
            </div>

            {isAdmin && (
                <div className="mb-8">
                    <InviteForm orgId={org.id}/>
                </div>
            )}

            <MemberList
                members={members}
                currentUserId={session.user.id}
                ownerId={org.ownerId}
                isAdmin={isAdmin}
                orgId={org.id}
            />
        </div>
    )
}