"use client"

import {useEffect} from "react"
import Link from "next/link";

type Props = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({error, reset}: Props) {
    useEffect(() => {
        // TODO: Use Sentry for logging later
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <p className="text-6xl font-medium text-muted-foreground/30 mb-6">
                    500
                </p>
                <h1 className="text-2xl font-medium mb-2">
                    Something went wrong
                </h1>
                <p className="text-muted-foreground text-sm mb-8">
                    An unexpected error occurred. We&#39;ve been notified and
                    are working on a fix.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="bg-black text-white rounded-lg px-6 py-2.5 text-sm hover:opacity-90 transition-opacity"
                    >
                        Try again
                    </button>
                    <Link
                        href="/dashboard"
                        className="border rounded-lg px-6 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    )
}