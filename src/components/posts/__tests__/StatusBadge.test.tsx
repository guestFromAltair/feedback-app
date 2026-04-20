import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import StatusBadge from "../StatusBadge"

describe("StatusBadge", () => {
    it("displays Under review for UNDER_REVIEW status", () => {
        render(<StatusBadge status="UNDER_REVIEW" />)
        expect(screen.getByText("Under review")).toBeInTheDocument()
    })

    it("displays Planned for PLANNED status", () => {
        render(<StatusBadge status="PLANNED" />)
        expect(screen.getByText("Planned")).toBeInTheDocument()
    })

    it("displays In progress for IN_PROGRESS status", () => {
        render(<StatusBadge status="IN_PROGRESS" />)
        expect(screen.getByText("In progress")).toBeInTheDocument()
    })

    it("displays Done for DONE status", () => {
        render(<StatusBadge status="DONE" />)
        expect(screen.getByText("Done")).toBeInTheDocument()
    })

    it("applies correct colour class for PLANNED", () => {
        const { container } = render(<StatusBadge status="PLANNED" />)
        const badge = container.firstChild as HTMLElement
        expect(badge.className).toContain("purple")
    })

    it("applies correct colour class for DONE", () => {
        const { container } = render(<StatusBadge status="DONE" />)
        const badge = container.firstChild as HTMLElement
        expect(badge.className).toContain("green")
    })
})