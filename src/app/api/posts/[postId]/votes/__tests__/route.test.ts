import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST, DELETE } from "../route"
import { Session } from "next-auth"

vi.mock("@/lib/db", () => ({
    prisma: {
        vote: {
            create: vi.fn(),
            delete: vi.fn(),
        },
    },
}))

vi.mock("@/auth", () => ({
    auth: vi.fn(),
}))

import { prisma } from "@/lib/db"
import { auth } from "@/auth"

function makeRequest(method: string) {
    return new Request(
        "http://localhost/api/posts/post-123/votes",
        { method }
    )
}

const mockParams = Promise.resolve({ postId: "post-123" })

describe("POST /api/posts/[postId]/votes", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns 401 if not authenticated", async () => {
        vi.mocked(auth as () => Promise<Session | null>).mockResolvedValue(null)
        const res = await POST(makeRequest("POST"), { params: mockParams })
        expect(res.status).toBe(401)
    })

    it("creates a vote and returns 201", async () => {
        vi.mocked(auth as () => Promise<Session | null>).mockResolvedValue({
            user: { id: "user-1", name: "Jane", email: "jane@test.com" },
            expires: new Date().toISOString()
        })

        vi.mocked(prisma.vote.create).mockResolvedValue({
            id: "vote-1",
            postId: "post-123",
            userId: "user-1",
            createdAt: new Date()
        })

        const res = await POST(makeRequest("POST"), { params: mockParams })
        expect(res.status).toBe(201)
        expect(prisma.vote.create).toHaveBeenCalledWith({
            data: { postId: "post-123", userId: "user-1" }
        })
    })

    it("returns 409 when voting twice", async () => {
        vi.mocked(auth as () => Promise<Session | null>).mockResolvedValue({
            user: { id: "user-1", name: "Jane", email: "jane@test.com" },
            expires: new Date().toISOString()
        })

        vi.mocked(prisma.vote.create).mockRejectedValue({ code: "P2002" })

        const res = await POST(makeRequest("POST"), { params: mockParams })
        expect(res.status).toBe(409)
    })
})

describe("DELETE /api/posts/[postId]/votes", () => {
    it("returns 401 if not authenticated", async () => {
        vi.mocked(auth as () => Promise<Session | null>).mockResolvedValue(null)
        const res = await DELETE(makeRequest("DELETE"), { params: mockParams })
        expect(res.status).toBe(401)
    })

    it("deletes a vote and returns 200", async () => {
        vi.mocked(auth as () => Promise<Session | null>).mockResolvedValue({
            user: { id: "user-1", name: "Jane", email: "jane@test.com" },
            expires: new Date().toISOString()
        })

        vi.mocked(prisma.vote.delete).mockResolvedValue({
            id: "vote-1",
            postId: "post-123",
            userId: "user-1",
            createdAt: new Date()
        })

        const res = await DELETE(makeRequest("DELETE"), { params: mockParams })
        expect(res.status).toBe(200)
        expect(prisma.vote.delete).toHaveBeenCalledWith({
            where: {
                postId_userId: {
                    postId: "post-123",
                    userId: "user-1"
                }
            }
        })
    })
})