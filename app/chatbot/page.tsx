"use client"

import { Suspense } from "react"
import Loading from "@/components/loading"
import ChatbotPageInner from "./ChatbotPageInner"

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function Page() {
  return (
    <Suspense fallback={<Loading fullScreen message="Loading chat..." />}>
      <ChatbotPageInner />
    </Suspense>
  )
}
