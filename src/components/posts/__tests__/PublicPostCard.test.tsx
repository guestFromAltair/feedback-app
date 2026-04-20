import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import PublicPostCard from "../PublicPostCard"

const mockPost = {
    id: "post-1",
    title: "Add dark mode",
    body: "Would love a dark theme",
    status: "PLANNED" as const,
    createdAt: new Date(),
    hasVoted: false,
    _count: { votes: 42, comments: 3 },
}

describe("PublicPostCard", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it("renders the post title", () => {
        render(<PublicPostCard post={mockPost} currentUserId="user-1" />)
        expect(screen.getByText("Add dark mode")).toBeInTheDocument()
    })

    it("renders the vote count", () => {
        render(<PublicPostCard post={mockPost} currentUserId="user-1" />)
        expect(screen.getByText("42")).toBeInTheDocument()
    })

    it("renders the status badge", () => {
        render(<PublicPostCard post={mockPost} currentUserId="user-1" />)
        expect(screen.getByText("Planned")).toBeInTheDocument()
    })

    it("redirects to login when unauthenticated user votes", () => {
        const assignMock = vi.fn()

        vi.stubGlobal("location", {
            ...window.location,
            assign: assignMock,
            set href(url: string) { assignMock(url) },
            get href() { return "http://localhost:3000" }
        })

        render(<PublicPostCard post={mockPost} currentUserId={null} />)

        const voteButton = screen.getByRole("button")
        fireEvent.click(voteButton)

        expect(assignMock).toHaveBeenCalledWith("/login")
    })

    it("optimistically updates vote count on click", async () => {
        vi.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response)

        render(<PublicPostCard post={mockPost} currentUserId="user-1" />)

        const voteButton = screen.getByRole("button")
        fireEvent.click(voteButton)

        await waitFor(() => {
            expect(screen.getByText("43")).toBeInTheDocument()
        })
    })

    it("reverts vote count if API call fails", async () => {
        vi.spyOn(global, "fetch").mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Server error" }),
        } as Response)

        render(<PublicPostCard post={mockPost} currentUserId="user-1" />)

        const voteButton = screen.getByRole("button")
        fireEvent.click(voteButton)

        await waitFor(() => {
            expect(screen.getByText("42")).toBeInTheDocument()
        })
    })
})