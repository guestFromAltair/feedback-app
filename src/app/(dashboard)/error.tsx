"use client"

import { useEffect } from "react"
import Link from "next/link"

type Props = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function DashboardError({ error, reset }: Props) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex items-center justify-center h-full px-4">
            <div className="text-center max-w-md">
                <p className="text-4xl font-medium text-muted-foreground/30 mb-4">
                    Oops
                </p>
                <h1 className="text-xl font-medium mb-2">
                    Something went wrong
                </h1>
                <p className="text-muted-foreground text-sm mb-6">
                    There was a problem loading this page.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="bg-black text-white rounded-lg px-4 py-2 text-sm"
                    >
                        Try again
                    </button>
                    <Link
                        href="/dashboard"
                        className="border rounded-lg px-4 py-2 text-sm hover:bg-muted transition-colors"
                    >
                        Back to dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}