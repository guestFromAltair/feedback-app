import Link from "next/link"
import {auth} from "@/auth"
import {redirect} from "next/navigation"

export default async function LandingPage() {
    const session = await auth()

    if (session?.user) {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen flex flex-col">

            <nav className="border-b px-4 md:px-8 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/" className="font-medium text-sm">
                        FeedbackApp
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/signup"
                            className="text-sm bg-black text-white rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex items-center justify-center px-4 py-24">
                <div className="max-w-2xl mx-auto text-center">

                    <div
                        className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-xs text-muted-foreground mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>
                        Open for feedback
                    </div>

                    <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 leading-tight">
                        Collect feedback from{" "}
                        <span className="text-muted-foreground">
              the people who matter
            </span>
                    </h1>

                    <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-xl mx-auto">
                        Give your users a place to submit ideas, vote on what matters
                        most, and stay in the loop on what you&#39;re building.
                    </p>

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Link
                            href="/signup"
                            className="bg-black text-white rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Create your workspace
                        </Link>
                        <Link
                            href="/login"
                            className="border rounded-lg px-6 py-3 text-sm hover:bg-muted transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>

                    <p className="text-xs text-muted-foreground mt-6">
                        Free to use. No credit card required.
                    </p>

                </div>
            </main>

            <section className="border-t px-4 md:px-8 py-20 bg-muted/30">
                <div className="max-w-5xl mx-auto">

                    <h2 className="text-2xl font-medium text-center mb-12">
                        Everything your team needs
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div className="space-y-3">
                            <div
                                className="w-10 h-10 rounded-xl bg-background border flex items-center justify-center text-lg">
                                📋
                            </div>
                            <h3 className="font-medium">Public feedback boards</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Share a public URL with your users. They submit ideas,
                                vote on what matters, and see what you&#39;re working on —
                                no account required.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div
                                className="w-10 h-10 rounded-xl bg-background border flex items-center justify-center text-lg">
                                🗳️
                            </div>
                            <h3 className="font-medium">Voting that actually works</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Users vote on what they want most. Your most requested
                                features rise to the top automatically so you always
                                know what to build next.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div
                                className="w-10 h-10 rounded-xl bg-background border flex items-center justify-center text-lg">
                                👥
                            </div>
                            <h3 className="font-medium">Team workspaces</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Invite your team, assign roles, and manage feedback
                                together. Admins control statuses, members stay
                                informed.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            <section className="px-4 md:px-8 py-20">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-medium mb-4">
                        Built for teams who listen to their users
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                        Most feedback gets lost in emails, Slack threads, and
                        support tickets. FeedbackApp gives it a home — a single
                        place where users can be heard and your team can respond.
                    </p>
                    <Link
                        href="/signup"
                        className="bg-black text-white rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity inline-block"
                    >
                        Start for free
                    </Link>
                </div>
            </section>

            <footer className="border-t px-4 md:px-8 py-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
                    <span className="text-sm font-medium">FeedbackApp</span>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/guestFromAltair/feedback-app.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            GitHub
                        </a>
                        <Link
                            href="/login"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/signup"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </footer>

        </div>
    )
}