import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import type { Session } from "next-auth"

vi.mock("@/lib/db", () => ({
    prisma: {
        organization: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        membership: {
            findMany: vi.fn(),
        },
    },
}))

vi.mock("@/auth", () => ({
    auth: vi.fn(),
}))

type AuthFunction = () => Promise<Session | null>;

const mockSession: Session = {
    user: {
        id: "user-1",
        name: "Jane",
        email: "jane@test.com"
    },
    expires: new Date().toISOString(),
}

function makeRequest(body: object) {
    return new Request("http://localhost/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
}

describe("POST /api/orgs", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns 401 if not authenticated", async () => {
        vi.mocked(auth as AuthFunction).mockResolvedValue(null)

        const req = makeRequest({ name: "Acme", slug: "acme" })
        const res = await POST(req)
        expect(res.status).toBe(401)
    })

    it("returns 400 if name is missing", async () => {
        vi.mocked(auth as AuthFunction).mockResolvedValue(mockSession)

        const req = makeRequest({ slug: "acme" })
        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it("returns 409 if slug is already taken", async () => {
        vi.mocked(auth as AuthFunction).mockResolvedValue(mockSession)

        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
            id: "existing-org",
            name: "Existing Org",
            slug: "acme",
            ownerId: "other-user",
            createdAt: new Date(),
        })

        const req = makeRequest({ name: "Acme", slug: "acme" })
        const res = await POST(req)
        expect(res.status).toBe(409)
    })

    it("creates an org and returns 201", async () => {
        vi.mocked(auth as AuthFunction).mockResolvedValue(mockSession)

        vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.organization.create).mockResolvedValue({
            id: "new-org",
            name: "Acme",
            slug: "acme",
            ownerId: "user-1",
            createdAt: new Date(),
        })

        const req = makeRequest({ name: "Acme", slug: "acme" })
        const res = await POST(req)
        expect(res.status).toBe(201)
    })
})