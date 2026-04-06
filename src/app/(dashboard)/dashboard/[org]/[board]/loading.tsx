import { Skeleton } from "@/components/ui/skeleton"

export default function BoardLoading() {
    return (
        <div className="p-4 md:p-8 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-9 w-28" />
            </div>

            <Skeleton className="h-4 w-16 mb-4" />

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
                            <Skeleton className="h-3 w-2/3" />
                            <div className="flex gap-2 mt-2">
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-28" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}