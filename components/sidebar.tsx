"use client"

import Link from "next/link"
import { UserPlus, LayoutDashboard, BarChart3, MessageSquare, Settings, FileText, Sparkles, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppState } from "./providers/app-state-provider"
import { useTheme } from "next-themes"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import ProfileSwitchModal from "./profile-switch-modal"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function Sidebar() {
    const { users, currentUser, setCurrentUser } = useAppState()
    const router = useRouter()
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const { resolvedTheme } = useTheme();
    const isMobile = useIsMobile();
    const [mobileOpen, setMobileOpen] = useState(false); // default closed

    // Always close sidebar on mount and when switching to mobile
    useEffect(() => {
        setMobileOpen(false);
    }, [isMobile]);

    const handleProfileSwitch = (userId: string) => {
        const userToSwitch = users[userId]
        if (userToSwitch) {
            setCurrentUser(userToSwitch)
            setTimeout(() => {
                if (userToSwitch.type === "startFresh") {
                    if (userToSwitch.hasCompletedOnboarding) {
                        router.push("/roadmap-dashboard")
                    } else {
                        router.push("/start-fresh")
                    }
                } else if (userToSwitch.type === "resume") {
                    if (userToSwitch.resumeText) {
                        router.push("/resume-dashboard")
                    } else {
                        router.push("/resume-upload")
                    }
                }
            }, 100)
        }
    }

    if (!currentUser) {
        return null;
    }

    // Sidebar button class for both nav and footer
    const sidebarButtonClass = `justify-start transition-all duration-200 ${resolvedTheme === 'dark'
        ? 'bg-white/15 hover:bg-white/25 hover:text-white text-white shadow-md hover:shadow-lg'
        : 'bg-[#6d4aff] hover:bg-[#5330cf] text-white !text-white hover:!text-white shadow-md hover:shadow-lg'
        }`;

    // Sidebar content as a function for reuse
    const sidebarContent = (
        <div className="flex flex-col h-full min-h-0 flex-1">
            {/* Profile Section - Fixed */}
            <div className={`p-4 border-b ${resolvedTheme === 'dark'
                ? 'border-white/20 bg-[#2d1e6b] backdrop-blur-sm'
                : 'border-none bg-[#5330cf] text-white backdrop-blur-sm'
                }`}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className={`w-full justify-start transition-all duration-200 ${resolvedTheme === 'dark'
                                ? 'bg-white/15 hover:bg-white/25 hover:text-white border-white/30 text-white shadow-md hover:shadow-lg'
                                : 'bg-[#6d4aff] hover:bg-[#5330cf] border-none text-white !text-white hover:!text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage
                                    src={`https://avatar.vercel.sh/${currentUser?.id}.png`}
                                    alt={currentUser?.name}
                                />
                                <AvatarFallback className={resolvedTheme === 'dark' ? 'text-white' : 'text-white'}>
                                    {currentUser?.name?.substring(0, 1)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-medium">{currentUser?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {currentUser?.type === "startFresh" ? "Beginner" : "Resume"} Profile
                                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.values(users).map((user) => (
                            <DropdownMenuItem
                                key={user.id}
                                onClick={() => handleProfileSwitch(user.id)}
                                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <span>{user.name}</span>
                                <span className="text-muted-foreground text-xs ml-2">({user.type === "startFresh" ? "Beginner" : "Resume"})</span>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setIsProfileModalOpen(true)}
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <UserPlus className="mr-2 h-4 w-4 text-primary" />
                            <span>Add New Profile</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {/* Navigation - Scrollable */}
            <div className={`flex-1 overflow-y-auto min-h-0 ${resolvedTheme === 'dark' ? '' : 'bg-[#5330cf] text-white'}`}>
                <nav className="flex flex-col space-y-1 p-4">
                    {currentUser?.type === "startFresh" &&
                        <>
                            {currentUser.hasCompletedOnboarding && (
                                <Button variant="ghost" className={sidebarButtonClass} asChild>
                                    <Link href="/roadmap-dashboard">
                                        <LayoutDashboard className={`mr-2 h-4 w-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-blue-400'}`} />
                                        <span>Roadmap Dashboard</span>
                                    </Link>
                                </Button>
                            )}
                            <Button variant="ghost" className={sidebarButtonClass} asChild>
                                <Link href="/start-fresh">
                                    <Sparkles className={`mr-2 h-4 w-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-blue-400'}`} />
                                    <span>
                                        {currentUser.hasCompletedOnboarding ? "Update Details" : "Complete Onboarding"}
                                    </span>
                                </Link>
                            </Button>
                        </>
                    }
                    {currentUser?.type === "resume" &&
                        <>
                            {currentUser.resumeText && (
                                <Button variant="ghost" className={sidebarButtonClass} asChild>
                                    <Link href="/resume-dashboard">
                                        <LayoutDashboard className={`mr-2 h-4 w-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-blue-400'}`} />
                                        <span>Resume Dashboard</span>
                                    </Link>
                                </Button>
                            )}
                            <Button variant="ghost" className={sidebarButtonClass} asChild>
                                <Link href="/resume-upload">
                                    <FileText className={`mr-2 h-4 w-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-blue-400'}`} />
                                    <span>
                                        {currentUser.resumeText ? "Update Resume" : "Upload Resume"}
                                    </span>
                                </Link>
                            </Button>
                        </>
                    }
                </nav>
            </div>
            {/* Footer - Fixed at bottom in mobile, normal in desktop */}
            <div className={`p-4 mt-auto border-t-2 ${resolvedTheme === 'light' ? 'border-[#7c3aed]' : 'border-[#a78bfa]'} ${resolvedTheme === 'dark'
                ? 'bg-[#2d1e6b] text-white'
                : 'bg-[#5330cf] text-white backdrop-blur-sm'
                }`}>
                <nav className="flex flex-col space-y-1">
                    {currentUser && (
                        <Button variant="ghost" className={sidebarButtonClass} asChild>
                            <Link href="/chatbot">
                                <MessageSquare className={`mr-2 h-4 w-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-blue-400'}`} />
                                <span>Career Guide Chatbot</span>
                            </Link>
                        </Button>
                    )}
                    <Button variant="ghost" className={sidebarButtonClass} asChild>
                        <Link href="/settings">
                            <Settings className={`mr-2 h-4 w-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-blue-400'}`} />
                            <span>Settings</span>
                        </Link>
                    </Button>
                </nav>
            </div>
        </div>
    );

    // --- MOBILE SIDEBAR ---
    if (isMobile) {
        return (
            <>
                {/* Hamburger Icon */}
                <button
                    className="fixed top-2 right-4 z-50 p-2 rounded-md bg-gradient-to-br from-[#5330cf] via-[#4a2bb8] to-[#3a1f9e] shadow-lg border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open sidebar"
                >
                    <Menu className="h-7 w-7" />
                </button>
                {/* Mobile Sidebar Drawer using Sheet */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent
                        side="left"
                        hideClose
                        className="p-0 w-64 max-w-[80vw] bg-gradient-to-b from-[#5330cf] via-[#4a2bb8] to-[#3a1f9e] border-r border-white/20 shadow-2xl flex flex-col"
                    >
                        {/* Visually hidden title for accessibility */}
                        <SheetTitle asChild>
                            <VisuallyHidden>Sidebar Navigation</VisuallyHidden>
                        </SheetTitle>
                        <div className="flex-1 overflow-y-auto pt-2">
                            {sidebarContent}
                        </div>
                    </SheetContent>
                </Sheet>
                {/* Close button OUTSIDE sidebar, top right of screen */}
                {mobileOpen && (
                    <button
                        className="fixed top-0 right-2 z-[100] rounded-full from-[#5330cf] via-[#4a2bb8] to-[#3a1f9e] shadow-4xl text-white transition-all"
                        style={{ width: 60, height: 60 }}
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <span className="text-4xl leading-none text-white drop-shadow-[0_0_8px_white] filter brightness-150">
                            ×
                        </span>
                    </button>
                )}
                {/* Profile Switch Modal (keep outside sidebar) */}
                <ProfileSwitchModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            </>
        );
    }

    // --- DESKTOP SIDEBAR ---
    return (
        <>
            <aside className={`fixed left-0 top-[64px] bottom-0 w-64 border-r-2 ${resolvedTheme === 'light' ? 'border-[#7c3aed]' : 'border-[#a78bfa]'} flex flex-col transition-colors duration-200 z-30 ${resolvedTheme === 'dark'
                ? 'bg-[#2d1e6b]'
                : 'bg-[#5330cf]'
                }`}>
                {sidebarContent}
            </aside>
            {/* Profile Switch Modal */}
            <ProfileSwitchModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </>
    )
}
