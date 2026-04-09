import SignupClient from "./SignupClient"
import {getSafeRedirect} from "@/lib/utils"

const DEFAULT_DASHBOARD_PATH = "/dashboard"

export default async function SignupPage({searchParams}: { searchParams: { redirect?: string } }) {
    const awaitedSearchParams = await searchParams;
    const redirectTo = getSafeRedirect(
        awaitedSearchParams.redirect,
        DEFAULT_DASHBOARD_PATH
    )

    return <SignupClient redirectTo={redirectTo}/>
}