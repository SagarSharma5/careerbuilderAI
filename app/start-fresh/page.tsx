"use client"

import { Suspense } from "react"
import Loading from "@/components/loading"
import StartFreshPageInner from "./StartFreshPageInner"

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function Page() {
  return (
    <Suspense fallback={<Loading fullScreen message="Loading profile..." />}>
      <StartFreshPageInner />
    </Suspense>
  )
}
