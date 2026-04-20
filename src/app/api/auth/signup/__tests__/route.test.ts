import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"

vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Map([
        ["x-forwarded-for", "127.0.0.1"]
    ]))
}))

vi.mock("@/lib/ratelimit", () => ({
    signupRateLimit: {
        limit: vi.fn().mockResolvedValue({ success: true })
    }
}))

vi.mock("@/lib/db", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn()
        }
    }
}))

vi.mock("@/lib/email", () => ({
    sendWelcomeEmail: vi.fn().mockResolvedValue(undefined)
}))

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn().mockResolvedValue("hashed_password"),
        compare: vi.fn().mockResolvedValue(true)
    }
}))

import { prisma } from "@/lib/db"

function makeRequest(body: object) {
    return new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
}

describe("POST /api/auth/signup", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns 400 if name is missing", async () => {
        const req = makeRequest({ email: "test@test.com", password: "password123" })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it("returns 400 if email is invalid", async () => {
        const req = makeRequest({
            name: "Jane",
            email: "not-an-email",
            password: "password123"
        })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it("returns 400 if password is too short", async () => {
        const req = makeRequest({
            name: "Jane",
            email: "jane@test.com",
            password: "short"
        })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it("returns 409 if email (user) already exists with a password", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "user-1",
            email: "jane@test.com",
            password: "existing_hash",
            name: "Jane",
            avatarUrl: null,
            createdAt: new Date()
        })

        const req = makeRequest({
            name: "Jane",
            email: "jane@test.com",
            password: "password123"
        })
        const res = await POST(req)
        expect(res.status).toBe(409)

        const data = await res.json()
        expect(data.error).toBe("An account with this email already exists")
    })

    it("upgrades a lightweight account when email exists without password", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "user-1",
            email: "jane@test.com",
            password: null,
            name: "Jane",
            avatarUrl: null,
            createdAt: new Date()
        })

        vi.mocked(prisma.user.update).mockResolvedValue({
            id: "user-1",
            email: "jane@test.com",
            password: "hashed_password",
            name: "Jane",
            avatarUrl: null,
            createdAt: new Date()
        })

        const req = makeRequest({
            name: "Jane",
            email: "jane@test.com",
            password: "password123"
        })
        const res = await POST(req)
        expect(res.status).toBe(201)
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { email: "jane@test.com" },
            data: { name: "Jane", password: "hashed_password" }
        })
    })

    it("creates a new user and returns 201", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.user.create).mockResolvedValue({
            id: "new-user",
            email: "jane@test.com",
            password: "hashed_password",
            name: "Jane",
            avatarUrl: null,
            createdAt: new Date()
        })

        const req = makeRequest({
            name: "Jane",
            email: "jane@test.com",
            password: "password123"
        })
        const res = await POST(req)
        expect(res.status).toBe(201)

        const data = await res.json()
        expect(data.userId).toBe("new-user")
    })
})