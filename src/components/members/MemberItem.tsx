"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Role } from "@prisma/client"

type Member = {
    id: string
    role: Role
    joinedAt: Date
    user: {
        id: string
        name: string | null
        email: string | null
        avatarUrl: string | null
    }
}

type Props = {
    member: Member
    currentUserId: string
    ownerId: string
    isAdmin: boolean
    orgId: string
    isLast: boolean
}

export default function MemberItem({
                                       member,
                                       currentUserId,
                                       ownerId,
                                       isAdmin,
                                       orgId,
                                       isLast
                                   }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const isOwner = member.user.id === ownerId
    const isCurrentUser = member.user.id === currentUserId

    const displayName =
        member.user.name ?? member.user.email ?? "Unknown"

    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    async function handleRoleChange(newRole: Role) {
        setLoading(true)
        try {
            await fetch(`/api/orgs/${orgId}/members/${member.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            })
            router.refresh()
        } catch {
            // silently fail — router.refresh will show correct state
        } finally {
            setLoading(false)
        }
    }

    async function handleRemove() {
        setLoading(true)
        try {
            await fetch(`/api/orgs/${orgId}/members/${member.id}`, {
                method: "DELETE",
            })
            router.refresh()
        } catch {
            setLoading(false)
        }
    }

    return (
        <div className={`flex items-center gap-3 px-4 py-3 ${!isLast ? "border-b" : ""} ${loading ? "opacity-50" : ""}`}>

            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                {member.user.avatarUrl ? (
                    <img
                        src={member.user.avatarUrl}
                        alt={displayName}
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    initials
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                    {displayName}
                    {isCurrentUser && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (you)
                        </span>
                    )}
                </p>
                {member.user.name && (
                    <p className="text-xs text-muted-foreground truncate">
                        {member.user.email}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2">
                {isOwner ? (
                    <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">
                        owner
                    </span>
                ) : isAdmin && !isCurrentUser ? (
                    <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(e.target.value as Role)}
                        disabled={loading}
                        className="text-xs border rounded-lg px-2 py-1 bg-background"
                    >
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                    </select>
                ) : (
                    <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">
                        {member.role.toLowerCase()}
                    </span>
                )}

                {isAdmin && !isOwner && !isCurrentUser && (
                    <button
                        onClick={handleRemove}
                        disabled={loading}
                        className="text-xs text-muted-foreground hover:text-red-600 transition-colors"
                    >
                        Remove
                    </button>
                )}
            </div>

        </div>
    )
}