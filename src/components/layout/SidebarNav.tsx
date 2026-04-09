"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { handleSignOut } from "@/lib/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {useState} from "react";

type Org = {
    id: string
    name: string
    slug: string
    boards: Board[]
    isAdmin: boolean
}

type Board = {
    id: string
    name: string
    slug: string
    isPublic: boolean
}

type User = {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
}

type Props = {
    orgs: Org[]
    user: User
    onNavigateAction?: () => void
}

const BOARD_COLORS = [
    "bg-purple-400",
    "bg-teal-400",
    "bg-amber-400",
    "bg-pink-400",
    "bg-blue-400"
]

function getInitials(name?: string | null): string {
    if (!name) return "?"
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

export default function SidebarNav({ orgs, user, onNavigateAction }: Props) {
    const pathname = usePathname()

    const activeOrg = orgs.find((org) =>
        pathname.startsWith(`/dashboard/${org.slug}`)
    )

    const boards = activeOrg?.boards || []

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-4 border-b shrink-0">
                <Link
                    href="/dashboard"
                    onClick={onNavigateAction}
                    className="font-medium text-sm"
                >
                    FeedbackApp
                </Link>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                {orgs.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-2">
                        No workspaces yet
                    </p>
                )}

                {orgs.map((org, i) => {
                    const orgHref = `/dashboard/${org.slug}`
                    const isActiveOrg = pathname.startsWith(orgHref)

                    return (
                        <div key={org.id}>
                            <Link
                                href={orgHref}
                                onClick={onNavigateAction}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                                    isActiveOrg
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                    BOARD_COLORS[i % BOARD_COLORS.length]
                                }`} />
                                <span className="truncate">{org.name}</span>
                            </Link>

                            {isActiveOrg && (
                                <div className="ml-4 mt-1 space-y-0.5">
                                    {boards.map((board) => (
                                        <Link
                                            key={board.id}
                                            href={`/dashboard/${org.slug}/${board.slug}`}
                                            onClick={onNavigateAction}
                                            className={`flex items-center px-2 py-1 rounded-md text-sm transition-colors ${
                                                pathname ===
                                                `/dashboard/${org.slug}/${board.slug}`
                                                    ? "bg-background border text-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                                            }`}
                                        >
                                            <span className="truncate">{board.name}</span>
                                        </Link>
                                    ))}

                                    {org.isAdmin && (
                                        <Link
                                            href={`/dashboard/${org.slug}/members`}
                                            onClick={onNavigateAction}
                                            className={`flex items-center px-2 py-1 rounded-md text-sm transition-colors ${
                                                pathname === `/dashboard/${org.slug}/members`
                                                    ? "bg-background border text-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                                            }`}
                                        >
                                            Members
                                        </Link>
                                    )}

                                    {org.isAdmin && (
                                        <Link
                                            href={`/dashboard/${org.slug}/settings`}
                                            onClick={onNavigateAction}
                                            className={`flex items-center px-2 py-1 rounded-md text-sm transition-colors ${
                                                pathname === `/dashboard/${org.slug}/settings`
                                                    ? "bg-background border text-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                                            }`}
                                        >
                                            Settings
                                        </Link>
                                    )}

                                </div>
                            )}
                        </div>
                    )
                })}

                <Link
                    href="/dashboard/new"
                    onClick={onNavigateAction}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                >
                    <span className="w-2 h-2 rounded-full border border-muted-foreground shrink-0" />
                    <span>New workspace</span>
                </Link>
            </nav>
            <div className="border-t px-2 py-3 shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-background transition-colors text-left">
                            <Avatar className="w-6 h-6 flex-shrink-0">
                                <AvatarImage src={user.image ?? ""} />
                                <AvatarFallback className="text-xs">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard" onClick={onNavigateAction}>
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <form action={handleSignOut} className="w-full">
                            <button
                                type="submit"
                                className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer outline-hidden"
                            >
                                Sign out
                            </button>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}