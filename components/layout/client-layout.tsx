"use client"

import { usePathname, useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { useAppState } from "@/components/providers/app-state-provider"
import { useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import AppHeader from "@/components/header"

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { currentUser } = useAppState()
    const isLandingPage = pathname === "/"
    const isProfileCreationPage = pathname === "/start-fresh" || pathname === "/resume-upload"
    const isMobile = useIsMobile()
    const isAboutPage = pathname === "/about"
    const isFAQPage = pathname === "/faq"

    useEffect(() => {
        const shouldRedirect = !isLandingPage && !isProfileCreationPage && pathname !== "/about" && pathname !== "/faq" && !currentUser;
        if (shouldRedirect) {
            router.replace("/");
        }
    }, [pathname, currentUser, router]);

    if (isLandingPage || isAboutPage || isFAQPage) {
        return <main className="min-h-screen">{children}</main>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <div className="flex flex-1 min-h-0">
                <Sidebar />
                <main
                    className={`flex-1 h-full flex flex-col ${!isMobile ? "ml-64" : ""}`}

                >
                    <div className={`flex-grow px-6 pt-4 ${isMobile ? "pt-10" : "mt-2"}`} >
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}