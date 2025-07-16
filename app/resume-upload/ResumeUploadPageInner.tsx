"use client"

import ResumeUploadForm from "@/components/resume-upload/resume-upload-form";
import { useAppState } from "@/components/providers/app-state-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/loading";

export default function ResumeUploadPageInner() {
    const { currentUser, isRestoringSession } = useAppState();
    const router = useRouter();

    useEffect(() => {
        if (!isRestoringSession && (!currentUser || currentUser.type !== "resume")) {
            router.replace("/"); // Redirect to home instead of choose-path
        }
    }, [currentUser, router, isRestoringSession]);

    if (isRestoringSession) {
        return <Loading message="Restoring session..." />;
    }
    if (!currentUser || currentUser.type !== "resume") {
        return <Loading message="Loading profile..." />;
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Upload Your Resume</h1>
            <p className="text-muted-foreground mb-8">
                Let's analyze your resume to provide personalized insights and suggestions.
                {currentUser.resumeFileName && ` Currently uploaded: ${currentUser.resumeFileName}`}
            </p>
            <ResumeUploadForm key={currentUser.id} profile={currentUser} />
        </div>
    );
}
