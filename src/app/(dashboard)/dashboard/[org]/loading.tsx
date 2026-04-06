import { Skeleton } from "@/components/ui/skeleton"

export default function OrgLoading() {
    return (
        <div className="p-4 md:p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-28" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-xl p-5 space-y-3">
                        <div className="flex items-start justify-between">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-5 w-14 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                ))}
            </div>
        </div>
    )
}