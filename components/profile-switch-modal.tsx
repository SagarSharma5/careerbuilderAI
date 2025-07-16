"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAppState } from "./providers/app-state-provider"
import { StartFreshProfile, ResumeProfile } from "@/types"
import { Sparkles, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface ProfileSwitchModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ProfileSwitchModal({ isOpen, onClose }: ProfileSwitchModalProps) {
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()
    const { users, addUser, currentUser } = useAppState()
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === 'light';

    const handleStartFresh = () => {
        if (!currentUser?.name) return

        setIsCreating(true)
        const newProfile: StartFreshProfile = {
            id: `startFresh-${Math.random().toString(36).slice(2)}-${Date.now()}`,
            name: currentUser.name,
            type: "startFresh",
            hasCompletedOnboarding: false,
            educationLevel: "",
            interests: [],
            strengths: [],
            workPreferences: [],
            broadField: "",
            specificRole: "",
            chatHistory: []
        }

        addUser(newProfile)
        onClose()
        setTimeout(() => {
            router.push(`/start-fresh?t=${Date.now()}`)
        }, 100)
    }

    const handleUploadResume = () => {
        if (!currentUser?.name) return

        setIsCreating(true)
        const newProfile: ResumeProfile = {
            id: `resume-${Math.random().toString(36).slice(2)}-${Date.now()}`,
            name: currentUser.name,
            type: "resume",
            hasCompletedOnboarding: false,
            resumeText: undefined,
            resumeFileName: undefined,
            atsScore: undefined,
            skillsChart: [],
            analysis: {
                mostUsedSkills: [],
                matchScore: undefined,
                sectionSuggestions: {},
                improvementAreas: []
            },
            suggestions: {
                skillsToLearn: [],
                relevantCourses: [],
                certifications: [],
                projectIdeas: [],
                jobListings: []
            },
            chatHistory: []
        }

        addUser(newProfile)
        onClose()
        setTimeout(() => {
            router.push(`/resume-upload?t=${Date.now()}`)
        }, 100)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`sm:max-w-[420px] p-0 gap-0 ${isLight ? 'bg-white border-gray-200' : ''}`}>
                <DialogHeader className={`px-5 py-4 border-b ${isLight ? 'border-gray-200' : ''}`}>
                    <DialogTitle className={`text-lg font-medium ${isLight ? 'text-gray-900' : ''}`}>Create New Profile</DialogTitle>
                </DialogHeader>
                <div className={`p-5 ${isLight ? 'bg-gray-50' : ''}`}>
                    <div className="grid gap-3">
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                                "relative overflow-hidden rounded-md border p-4 cursor-pointer group transition-colors",
                                isLight
                                    ? "bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100"
                                    : "bg-card border hover:border-purple-500/50 hover:bg-purple-500/5",
                            )}
                            onClick={handleStartFresh}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "rounded-full p-2",
                                    isLight ? "bg-purple-100" : "bg-purple-900/50"
                                )}>
                                    <Sparkles className={cn("h-5 w-5", isLight ? "text-purple-600" : "text-purple-400")} />
                                </div>
                                <div>
                                    <h3 className={cn("text-base font-medium", isLight ? "text-purple-900" : "")}>Start Fresh</h3>
                                    <p className={cn("text-sm", isLight ? "text-purple-700" : "text-muted-foreground")}>Begin your career journey from scratch</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                                "relative overflow-hidden rounded-md border p-4 cursor-pointer group transition-colors",
                                isLight
                                    ? "bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100"
                                    : "bg-card border hover:border-blue-500/50 hover:bg-blue-500/5",
                            )}
                            onClick={handleUploadResume}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "rounded-full p-2",
                                    isLight ? "bg-blue-100" : "bg-blue-900/50"
                                )}>
                                    <FileText className={cn("h-5 w-5", isLight ? "text-blue-600" : "text-blue-400")} />
                                </div>
                                <div>
                                    <h3 className={cn("text-base font-medium", isLight ? "text-blue-900" : "")}>Upload Resume</h3>
                                    <p className={cn("text-sm", isLight ? "text-blue-700" : "text-muted-foreground")}>Analyze your existing experience</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}