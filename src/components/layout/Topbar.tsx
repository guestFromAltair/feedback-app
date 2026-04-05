"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import SidebarNav from "./SidebarNav"

type Org = {
    id: string
    name: string
    slug: string
    boards: Board[]
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
}

function HamburgerIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    )
}

export default function Topbar({ orgs, user }: Props) {
    const [open, setOpen] = useState(false)

    return (
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-muted/30 shrink-0">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <button
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Open menu"
                    >
                        <HamburgerIcon />
                    </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-56 p-0">
                    <SidebarNav
                        orgs={orgs}
                        user={user}
                        onNavigateAction={() => setOpen(false)}
                    />
                </SheetContent>
            </Sheet>
            <span className="font-medium text-sm">FeedbackApp</span>
        </header>
    )
}