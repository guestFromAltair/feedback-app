import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Sidebar from "@/components/layout/Sidebar"
import React from "react";
import Topbar from "@/components/layout/Topbar";

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
                    boards: true
                }
            }
        }
    })

    const orgs = memberships.map((m) => {
        const isAdmin = m.role === "ADMIN";

        return {
            ...m.org,
            boards: isAdmin
                ? m.org.boards
                : m.org.boards.filter(board => board.isPublic),
            isAdmin
        };
    });

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Topbar orgs={orgs} user={session.user} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar orgs={orgs} user={session.user} />
                <main className="flex-1 overflow-y-auto bg-background">
                    {children}
                </main>
            </div>
        </div>
    )
}