"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
    postId: string
    currentTitle: string
    currentBody: string | null
}

export default function EditPostDialog({postId, currentTitle, currentBody}: Props) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState(currentTitle)
    const [body, setBody] = useState(currentBody ?? "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({title, body: body || null})
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setOpen(false)
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    function handleOpenChange(value: boolean) {
        setOpen(value)
        if (!value) {
            setTitle(currentTitle)
            setBody(currentBody ?? "")
            setError(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Edit
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit post</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            required
                            maxLength={200}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                            Description{" "}
                            <span className="text-muted-foreground font-normal">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                            rows={4}
                            maxLength={2000}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => handleOpenChange(false)}
                            className="border rounded-lg px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}