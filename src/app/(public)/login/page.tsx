import { signIn } from "@/auth"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-xl">
        <div>
          <h1 className="text-2xl font-medium">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back to Feedbacker
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server"
            await signIn("credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              redirectTo: "/dashboard",
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

        {/* GitHub OAuth */}
        <form
          action={async () => {
            "use server"
            await signIn("github", { redirectTo: "/dashboard" })
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
          <a href="/signup" className="underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}