"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { handleSignOut } from "@/lib/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- Types ---
type Org = { id: string; name: string; slug: string }
type User = { id?: string; name?: string | null; email?: string | null; image?: string | null }
type Board = { id: string; name: string; slug: string; isPublic: boolean }
type Props = { orgs: Org[]; user: User }

const BOARD_COLORS = ["bg-purple-400", "bg-teal-400", "bg-amber-400", "bg-pink-400", "bg-blue-400"]

export default function Sidebar({ orgs, user }: Props) {
    const pathname = usePathname()
    const [boards, setBoards] = useState<Board[]>([])

    // 1. Logic to find the active organization
    const activeOrg = orgs.find((org) => pathname.startsWith(`/dashboard/${org.slug}`))

    // 2. Fetch boards when activeOrg changes
    useEffect(() => {
        if (!activeOrg) return
        fetch(`/api/orgs/${activeOrg.id}/boards`)
            .then((r) => r.json())
            .then(setBoards)
            .catch(() => setBoards([]))
    }, [activeOrg?.id])

    function getInitials(name?: string | null) {
        if (!name) return "?"
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    }

    return (
        <aside className="w-56 border-r flex flex-col h-full bg-muted/30 shrink-0">
            {/* Logo */}
            <div className="px-4 py-4 border-b">
                <span className="font-medium text-sm">Feedbacker</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                {orgs.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-2">No workspaces yet</p>
                )}

                {orgs.map((org, i) => {
                    const orgHref = `/dashboard/${org.slug}`
                    const isActiveOrg = pathname.startsWith(orgHref)

                    return (
                        <div key={org.id} className="space-y-1">
                            {/* Org Link */}
                            <Link
                                href={orgHref}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                                    isActiveOrg
                                        ? "bg-background border text-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full shrink-0 ${BOARD_COLORS[i % BOARD_COLORS.length]}`} />
                                <span className="truncate">{org.name}</span>
                            </Link>

                            {/* Nested Boards List */}
                            {isActiveOrg && boards.map((board) => {
                                const boardHref = `/dashboard/${org.slug}/${board.slug}`
                                const isBoardActive = pathname === boardHref

                                return (
                                    <Link
                                        key={board.id}
                                        href={boardHref}
                                        className={`flex items-center gap-2 pl-6 pr-2 py-1 rounded-md text-sm transition-colors ${
                                            isBoardActive
                                                ? "text-foreground font-medium"
                                                : "text-muted-foreground hover:text-foreground hover:bg-background"
                                        }`}
                                    >
                                        <span className="truncate">{board.name}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    )
                })}

                <Link href="/dashboard/new" className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-background transition-colors">
                    <span className="w-2 h-2 rounded-full border border-muted-foreground shrink-0" />
                    <span>New workspace</span>
                </Link>
            </nav>

            {/* User Menu */}
            <div className="border-t px-2 py-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-background transition-colors text-left">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={user.image ?? ""} />
                                <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <form action={handleSignOut} className="w-full">
                                <button type="submit" className="w-full text-left text-sm">Sign out</button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    )
}