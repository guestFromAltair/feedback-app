import Link from "next/link"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <p className="text-6xl font-medium text-muted-foreground/30 mb-6">
                    404
                </p>
                <h1 className="text-2xl font-medium mb-2">
                    Page not found
                </h1>
                <p className="text-muted-foreground text-sm mb-8">
                    The page you&#39;re looking for doesn&#39;t exist or you don&#39;t
                    have permission to view it.
                </p>
                <Link
                    href="/dashboard"
                    className="bg-black text-white rounded-lg px-6 py-2.5 text-sm hover:opacity-90 transition-opacity"
                >
                    Go to dashboard
                </Link>
            </div>
        </div>
    )
}