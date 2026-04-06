import { Skeleton } from "@/components/ui/skeleton"

export default function PostLoading() {
    return (
        <div className="p-4 md:p-8 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-36" />
            </div>
            <div className="border rounded-xl p-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 w-10">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-4 w-6" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2 pt-1">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>
                </div>
            </div>
            <Skeleton className="h-5 w-24 mb-4" />
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}