import type { UserProfile } from "@/types"

export function getRedirectPath(profile: UserProfile): string {
    if (!profile || !profile.type) return "/";

    if (profile.type === "startFresh") {
        // If onboarding not complete, go to onboarding page
        return profile.hasCompletedOnboarding ? "/roadmap-dashboard" : "/start-fresh";
    }
    if (profile.type === "resume") {
        // If onboarding not complete or resume not uploaded, go to resume upload
        return profile.hasCompletedOnboarding && "resumeText" in profile && !!profile.resumeText
            ? "/resume-dashboard"
            : "/resume-upload";
    }
    // For 'generic' or any unknown type, stay on landing page (do not redirect)
    return "/";
}
