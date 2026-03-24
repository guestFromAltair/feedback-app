// Re-export NextAuth handlers from the project-root auth module.
// `@/auth` resolves to `src/auth.ts` via tsconfig `paths`.
export { handlers, signIn, signOut, auth } from "../auth"

