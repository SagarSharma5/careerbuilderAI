"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAppState } from "@/components/providers/app-state-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LogOut, Moon, Sun, Monitor, AlertTriangle } from "lucide-react"
import { useTheme } from "next-themes"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const dynamic = 'force-dynamic';

export function SettingsPageInner() {
    const { currentUser, setCurrentUser } = useAppState()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = () => {
        setIsLoggingOut(true)
        // Dispatch custom logout event
        window.dispatchEvent(new Event('logout'))

        // Clear all session storage
        if (typeof window !== 'undefined') {
            // Clear session storage
            sessionStorage.clear()

            // Clear local storage
            localStorage.clear()

            // Clear all cookies
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // Clear any indexedDB databases
            if (window.indexedDB) {
                const databases = window.indexedDB.databases();
                databases.then(dbs => {
                    dbs.forEach(db => {
                        if (db.name) window.indexedDB.deleteDatabase(db.name);
                    });
                });
            }

            // Clear any service workers
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                });
            }
        }

        // Clear the state
        setCurrentUser(null)

        // Force a complete page reload and redirect
        window.location.href = "/"
    }

    useEffect(() => {
        if (!currentUser) {
            router.push("/")
        }
    }, [currentUser, router])

    if (!currentUser) {
        return null
    }

    return (
        <div className="container mx-auto px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your application settings and data.</p>
            </div>

            <div className="grid gap-6">
                {/* Account Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label>Profile Type</Label>
                                <p className="text-sm text-muted-foreground">
                                    {currentUser.type === "startFresh" ? "Beginner Profile" : "Resume Profile"}
                                </p>
                            </div>
                            <div>
                                <Label>Profile Name</Label>
                                <p className="text-sm text-muted-foreground">{currentUser.name}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="w-full sm:w-auto transition-all duration-200 hover:scale-105 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <LogOut className="mr-2 h-4 w-4 animate-spin" />
                                            Logging out...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                        Confirm Logout
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to logout? This will clear all your session data and return you to the landing page.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleLogout}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Yes, Logout
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

