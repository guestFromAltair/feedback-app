import { PostStatus } from "@prisma/client"

type Props = {
    status: PostStatus
}

const STATUS_CONFIG: Record<PostStatus, { label: string; className: string }> = {
    UNDER_REVIEW: {
        label: "Under review",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    PLANNED: {
        label: "Planned",
        className: "bg-purple-50 text-purple-700 border-purple-200",
    },
    IN_PROGRESS: {
        label: "In progress",
        className: "bg-teal-50 text-teal-700 border-teal-200",
    },
    DONE: {
        label: "Done",
        className: "bg-green-50 text-green-700 border-green-200",
    }
}

export default function StatusBadge({ status }: Props) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNDER_REVIEW

    return (
        <span
            className={`inline-flex items-center text-xs border rounded-full px-2 py-0.5 font-medium ${config.className}`}
        >
          {config.label}
        </span>
    )
}