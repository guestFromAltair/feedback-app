import {notFound, redirect} from "next/navigation"
import {prisma} from "@/lib/db"
import {auth} from "@/auth"
import AcceptInviteButton from "@/components/members/AcceptInviteButton"
import {handleSignOut} from "@/lib/actions";

export default async function InvitePage({params}: {
    params: Promise<{ token: string }>
}) {
    const {token} = await params

    const invite = await prisma.verificationToken.findUnique({
        where: {token}
    })

    if (!invite || invite.expires < new Date()) {
        notFound()
    }

    const [, orgId, role, email] = invite.identifier.split(":")

    const org = await prisma.organization.findUnique({
        where: {id: orgId}
    })

    if (!org) notFound()

    const session = await auth()

    if (!session?.user?.id) {
        redirect(`/signup?redirect=/invite/${token}`)
    }

    if (session.user.email !== email) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-full max-w-sm p-8 border rounded-xl space-y-6 text-center">
                    <h1 className="text-xl font-semibold">Wrong Account</h1>
                    <p className="text-sm text-muted-foreground">
                        This invite was sent to <span className="font-medium text-foreground">{email}</span>,
                        but you are signed in as <span
                        className="font-medium text-foreground">{session.user.email}</span>. You have no permission to accept this invite.
                    </p>

                    <div className="space-y-3">
                        <form action={handleSignOut}>
                            <button
                                type="submit"
                                className="w-full border rounded-lg px-4 py-2 text-sm hover:bg-muted transition-colors"
                            >
                                Switch to {email}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-sm p-8 border rounded-xl space-y-6 text-center">
                <div>
                    <h1 className="text-2xl font-medium mb-2">You&#39;re invited</h1>
                    <p className="text-muted-foreground text-sm">
                        You&#39;ve been invited to join{" "}
                        <span className="font-medium text-foreground">{org.name}</span>{" "}
                        on Feedbacker
                    </p>
                </div>

                <p className="text-xs text-muted-foreground">
                    This invite was sent to{" "}
                    <span className="font-medium">{email}</span>
                </p>

                <AcceptInviteButton
                    token={token}
                    orgSlug={org.slug}
                    isLoggedIn={!!session?.user}
                />
            </div>
        </div>
    )
}