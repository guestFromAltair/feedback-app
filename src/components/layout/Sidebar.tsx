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

export default function Sidebar({ orgs, user }: Props) {
    return (
        <aside className="hidden md:flex w-56 border-r flex-col h-full bg-muted/30 shrink-0">
            <SidebarNav orgs={orgs} user={user} />
        </aside>
    )
}