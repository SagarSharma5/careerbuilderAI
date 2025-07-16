import type React from "react"
import "./globals.css"
import { cn } from "@/lib/utils"
import { AppStateProvider } from "@/components/providers/app-state-provider"
import ClientLayout from "@/components/layout/client-layout"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
    title: "CareerBuilderAI",
    description: "Your personal AI-powered career coach",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>{/* Removed font preload for performance */}</head>
            <body className={cn("min-h-screen bg-background font-sans antialiased select-none")}
                style={{ fontFamily: 'system-ui, Arial, sans-serif' }}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <AppStateProvider>
                        <ClientLayout>{children}</ClientLayout>
                    </AppStateProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
