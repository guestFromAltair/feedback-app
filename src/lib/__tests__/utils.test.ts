import { describe, it, expect } from "vitest"

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

function getInitials(name?: string | null): string {
    if (!name) return "?"
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

describe("slugify", () => {
    it("converts spaces to hyphens", () => {
        expect(slugify("Acme Corp")).toBe("acme-corp")
    })

    it("converts to lowercase", () => {
        expect(slugify("FEEDBACKER")).toBe("feedbacker")
    })

    it("removes special characters", () => {
        expect(slugify("Hello, World!")).toBe("hello-world")
    })

    it("collapses multiple spaces", () => {
        expect(slugify("too   many   spaces")).toBe("too-many-spaces")
    })

    it("strips leading and trailing hyphens", () => {
        expect(slugify("  leading and trailing  ")).toBe("leading-and-trailing")
    })

    it("handles empty string", () => {
        expect(slugify("")).toBe("")
    })
})

describe("getInitials", () => {
    it("returns initials for a full name", () => {
        expect(getInitials("Jane Doe")).toBe("JD")
    })

    it("returns first letter only for single name", () => {
        expect(getInitials("Jane")).toBe("J")
    })

    it("returns ? for null", () => {
        expect(getInitials(null)).toBe("?")
    })

    it("returns ? for undefined", () => {
        expect(getInitials(undefined)).toBe("?")
    })

    it("only returns two characters maximum", () => {
        expect(getInitials("Jean Claude Van Damme")).toBe("JC")
    })
})