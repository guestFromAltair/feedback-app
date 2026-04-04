import {auth} from "@/auth"
import {redirect, notFound} from "next/navigation"
import {prisma} from "@/lib/db"
import WorkspaceSettingsForm from "@/components/settings/WorkspaceSettingsForm"
import DeleteWorkspaceButton from "@/components/settings/DeleteWorkspaceButton"

export default async function SettingsPage({params}: {
    params: Promise<{ org: string }>
}) {
    const {org: orgSlug} = await params

    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const org = await prisma.organization.findUnique({
        where: {slug: orgSlug}
    })

    if (!org) notFound()

    const membership = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: session.user.id,
                orgId: org.id
            }
        }
    })

    if (!membership || membership.role !== "ADMIN") notFound()

    const isOwner = org.ownerId === session.user.id

    return (
        <div className="p-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-medium">Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage your workspace
                </p>
            </div>

            <div className="border rounded-xl p-6 mb-6">
                <h2 className="text-base font-medium mb-1">General</h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Update your workspace name and URL
                </p>
                <WorkspaceSettingsForm
                    orgId={org.id}
                    currentName={org.name}
                    currentSlug={org.slug}
                />
            </div>

            {isOwner && (
                <div className="border border-red-200 rounded-xl p-6">
                    <h2 className="text-base font-medium text-red-700 mb-1">
                        Danger zone
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Permanently delete this workspace and all its data.
                        This action cannot be undone.
                    </p>
                    <DeleteWorkspaceButton
                        orgId={org.id}
                        orgName={org.name}
                    />
                </div>
            )}
        </div>
    )
}