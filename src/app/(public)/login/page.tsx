import { signIn } from "@/auth"
import { getSafeRedirect } from "@/lib/utils"

type Props = {
  searchParams: Promise<{ redirect?: string }>
}

const DEFAULT_DASHBOARD_PATH = "/dashboard";

export default async function LoginPage({ searchParams }: Props) {
  const { redirect } = await searchParams
  const redirectTo = getSafeRedirect(redirect, DEFAULT_DASHBOARD_PATH)
  return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 p-8 border rounded-xl">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-medium">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back to FeedbackApp
            </p>
          </div>

          <form
              action={async (formData: FormData) => {
                "use server"
                await signIn("credentials", {
                  email: formData.get("email"),
                  password: formData.get("password"),
                  redirectTo
                })
              }}
              className="space-y-4"
          >
            <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
            />
            <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
            />
            <button
                type="submit"
                className="w-full bg-black text-white rounded-lg px-3 py-2 text-sm"
            >
              Sign in
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-2">or</span>
            </div>
          </div>

          <form
              action={async () => {
                "use server"
                await signIn("github", { redirectTo })
              }}
          >
            <button
                type="submit"
                className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              Continue with GitHub
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <a href={`/signup?redirect=${redirectTo}`} className="underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
  )
}