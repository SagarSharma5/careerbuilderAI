"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers/app-state-provider";
import StartFreshForm from "@/components/start-fresh/start-fresh-form";
import Loading from "@/components/loading";

export default function StartFreshPageInner() {
    const { currentUser, isRestoringSession } = useAppState();
    const router = useRouter();

    useEffect(() => {
        if (!isRestoringSession && (!currentUser || currentUser.type !== "startFresh")) {
            router.replace("/"); // Redirect to home instead of choose-path
        }
    }, [currentUser, router, isRestoringSession]);

    if (isRestoringSession) {
        return <Loading message="Restoring session..." />;
    }
    if (!currentUser || currentUser.type !== "startFresh") {
        return <Loading message="Loading profile..." />;
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Let's Get to Know You</h1>
            <p className="text-muted-foreground mb-8">
                {currentUser.hasCompletedOnboarding
                    ? "Update your profile details to get better career suggestions."
                    : "Tell us a bit about yourself to get personalized career suggestions."}
            </p>
            <StartFreshForm key={currentUser.id} profile={currentUser} />
        </div>
    );
}