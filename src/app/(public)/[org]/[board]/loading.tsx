import { Skeleton } from "@/components/ui/skeleton"

export default function PublicBoardLoading() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="mb-8 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="mb-8">
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="flex gap-4 p-4 border rounded-xl"
                    >
                        <div className="flex flex-col items-center gap-1 w-10">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-4 w-6" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <div className="flex gap-2 mt-1">
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}