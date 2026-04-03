import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Sidebar from "@/components/layout/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const memberships = await prisma.membership.findMany({
        where: { userId: session.user.id },
        include: {
            org: {
                include: {
                    boards: true,
                },
            },
        },
    })

    const orgs = memberships.map((m) => ({
        ...m.org,
        boards: m.org.boards,
    }))

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar orgs={orgs} user={session.user} />
            <main className="flex-1 overflow-y-auto bg-background">
                {children}
            </main>
        </div>
    )
}