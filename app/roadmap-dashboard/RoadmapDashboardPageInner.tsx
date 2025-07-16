"use client"

import { useAppState } from "@/components/providers/app-state-provider"
import Loading from "@/components/loading"
import RoadmapAccordion, { type RoadmapAccordionProps } from '@/components/roadmap/RoadmapAccordion';
import LoadingModal from '@/components/loading-modal';

export default function RoadmapDashboardPageInner() {
    const { currentUser, isRestoringSession } = useAppState();
    if (isRestoringSession) {
        return <LoadingModal isLoading={true} message="Restoring session..." />;
    }
    if (!currentUser) {
        return <LoadingModal isLoading={true} message="Loading your profile..." />;
    }
    return (
        <div className="w-full flex flex-col px-4 pb-4 pt-2" style={{ height: 'calc(100vh - 6rem)', boxSizing: 'border-box' }}>
            <h1 className="text-2xl font-bold mb-4">Your Career Roadmap</h1>
            <div className="flex-1 flex flex-col">
                <RoadmapAccordion fitScreen />
            </div>
        </div>
    );
}
