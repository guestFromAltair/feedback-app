import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
    return (
        <div className="p-4 md:p-8 max-w-2xl">
            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-40" />
            </div>
            <div className="border rounded-xl p-6 mb-6 space-y-4">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-full" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-9 w-28" />
                </div>
            </div>
            <div className="border border-red-200 rounded-xl p-6 space-y-4">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-36" />
            </div>
        </div>
    )
}