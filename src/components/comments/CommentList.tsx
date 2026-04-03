import { type Comment, type User } from "@prisma/client"
import CommentItem from "./CommentItem"

type CommentWithAuthor = Comment & {
    author: Pick<User, "id" | "name" | "email"> | null
}

type Props = {
    comments: CommentWithAuthor[]
    currentUserId: string
    isAdmin: boolean
}

export default function CommentList({
                                        comments,
                                        currentUserId,
                                        isAdmin
                                    }: Props) {
    if (comments.length === 0) {
        return (
            <div className="text-sm text-muted-foreground py-4">
                No comments yet — be the first to comment.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                />
            ))}
        </div>
    )
}