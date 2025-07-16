import { Suspense } from "react";
import Loading from "@/components/loading";
import RoadmapDashboardPageInner from "./RoadmapDashboardPageInner";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function Page() {
  return (
    <Suspense fallback={<Loading fullScreen message="Loading dashboard..." />}>
      <RoadmapDashboardPageInner />
    </Suspense>
  );
}
