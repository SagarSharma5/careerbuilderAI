"use client"

import { Suspense } from "react"
import Loading from "@/components/loading"
import { ResumeDashboardPageInner } from "./ResumeDashboardPageInner"

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function Page() {
  return (
    <Suspense fallback={<Loading fullScreen message="Loading dashboard..." />}>
      <ResumeDashboardPageInner />
    </Suspense>
  )
}
