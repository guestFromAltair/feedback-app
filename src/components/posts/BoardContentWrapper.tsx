"use client"

import {useState} from "react"
import SubmitPostForm from "./SubmitPostForm"
import PaginatedPostList from "./PaginatedPostList"
import {PostStatus} from "@prisma/client";

type PostWithRelations = {
    id: string
    title: string
    body: string | null
    status: PostStatus
    createdAt: Date
    boardId: string
    authorId: string | null
    _count: { votes: number; comments: number }
    votes?: { id: string }[]
    hasVoted: boolean
}

type Props = {
    boardId: string
    currentUserId: string | null
    initialData: {
        initialPosts: PostWithRelations[]
        totalCount: number
        hasMore: boolean
        lastCursor: string | null
    }

}

export default function BoardContentWrapper({boardId, currentUserId, initialData}: Props) {
    const [refreshKey, setRefreshKey] = useState(0)

    return (
        <>
            <div className="mb-8">
                <SubmitPostForm
                    boardId={boardId}
                    onSuccess={() => setRefreshKey(prev => prev + 1)}
                />
            </div>

            <PaginatedPostList
                key={refreshKey}
                initialPosts={initialData.initialPosts}
                boardId={boardId}
                currentUserId={currentUserId}
                totalCount={initialData.totalCount}
                hasMore={initialData.hasMore}
                lastCursor={initialData.lastCursor}
            />
        </>
    )
}