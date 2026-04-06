import SignupClient from "./SignupClient"
import {getSafeRedirect} from "@/lib/utils"

const DEFAULT_DASHBOARD_PATH = "/dashboard"

export default function SignupPage({searchParams}: { searchParams: { redirect?: string } }) {
    const redirectTo = getSafeRedirect(
        searchParams.redirect,
        DEFAULT_DASHBOARD_PATH
    )

    return <SignupClient redirectTo={redirectTo}/>
}