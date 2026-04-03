import { Role } from "@prisma/client"
import MemberItem from "./MemberItem"

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
    members: Member[]
    currentUserId: string
    ownerId: string
    isAdmin: boolean
    orgId: string
}

export default function MemberList({
                                       members,
                                       currentUserId,
                                       ownerId,
                                       isAdmin,
                                       orgId
                                   }: Props) {
    return (
        <div className="border rounded-xl overflow-hidden">
            {members.map((member, index) => (
                <MemberItem
                    key={member.id}
                    member={member}
                    currentUserId={currentUserId}
                    ownerId={ownerId}
                    isAdmin={isAdmin}
                    orgId={orgId}
                    isLast={index === members.length - 1}
                />
            ))}
        </div>
    )
}