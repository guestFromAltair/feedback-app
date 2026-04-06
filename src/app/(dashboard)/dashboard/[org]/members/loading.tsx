import { Skeleton } from "@/components/ui/skeleton"

export default function MembersLoading() {
    return (
        <div className="p-4 md:p-8 max-w-2xl">
            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="border rounded-xl p-4 mb-8 space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </div>
            <div className="border rounded-xl overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`flex items-center gap-3 px-4 py-3 ${
                            i < 3 ? "border-b" : ""
                        }`}
                    >
                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}