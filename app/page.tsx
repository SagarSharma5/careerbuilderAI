"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import Spline from "@splinetool/react-spline"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useAppState } from "@/components/providers/app-state-provider";
import { v4 as uuidv4 } from "uuid";


const CustomCursor = dynamic(() => import('@/components/custom-cursor'), { ssr: false })

export default function LandingPage() {
    const router = useRouter();
    const [showChoosePath, setShowChoosePath] = useState(false);
    const [selectedPath, setSelectedPath] = useState<"startFresh" | "resume" | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { theme, resolvedTheme } = useTheme();
    const { addUser } = useAppState();

    return (
        <>
            <style>{`body { cursor: none !important; } * { cursor: none !important; }`}</style>
            <div className="relative min-h-screen w-full overflow-hidden cursor-none">
                {/* Background Image */}
                <div className="fixed inset-0 w-full h-full">
                    <div className="absolute inset-0" />
                    <Image
                        src="/landingbg.jpeg"
                        alt="Background"
                        fill
                        priority
                        className="w-full h-full object-cover"
                        sizes="100vw"
                    />
                </div>

                <CustomCursor />
                {/* 3D Model Background */}
                <div className="fixed inset-0 w-full h-full z-20 pointer-events-auto">
                    <div className="w-full h-full bg-transparent">
                        <Spline
                            scene="https://prod.spline.design/AvYw20tM15kn10Xr/scene.splinecode"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-30 flex flex-col pointer-events-none">
                    {/* Header */}
                    <header className="w-full px-8 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-white hover:text-white/80">
                            CareerBuilder.AI
                        </Link>
                        <div className="flex gap-4 pointer-events-auto">
                            <Link href="/about" className="text-base font-medium text-white/80 hover:text-white transition-colors duration-150">
                                About Us
                            </Link>
                            <Link href="/faq" className="text-base font-medium text-white/80 hover:text-white transition-colors duration-150">
                                FAQ
                            </Link>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-start justify-center p-4 text-left pl-[10%]">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white drop-shadow-lg max-w-2xl"
                        >
                            <span className="text-white">Build Your Own Career</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1 }}
                            className="text-lg md:text-xl text-white max-w-xl mb-8 drop-shadow-lg"
                        >
                            Get personalized AI-powered guidance to navigate your career path, whether you're starting fresh or aiming
                            higher.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="flex gap-4 pointer-events-auto"
                        >
                            <Button className="text-lg bg-white text-black hover:bg-white/50 transform duration-300 ease-in-out" onClick={() => setShowChoosePath(true)}>
                                Get Started
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
            {/* Choose Path Modal */}
            <Dialog open={showChoosePath} onOpenChange={setShowChoosePath}>
                <DialogContent
                    className={`w-[60vw] max-w-3xl h-[60vh] max-h-[90vh] flex flex-col items-center justify-center border-2 shadow-2xl transition-colors duration-200
                        ${resolvedTheme === 'dark' ? 'bg-[#18181b] border-[#7c3aed]' : 'bg-white border-[#5330cf]'}
                    `}
                >
                    <div className="flex flex-col items-center w-full h-full justify-center gap-8">
                        <DialogTitle className="text-3xl font-bold text-center mb-2">Choose Your Path</DialogTitle>
                        <div className="flex flex-row gap-8 w-full justify-center">
                            <Card
                                className={`flex-1 p-6 cursor-pointer border-2 rounded-xl transition-all duration-200 shadow-md
                                    ${selectedPath === "startFresh"
                                        ? (theme === 'dark' ? 'border-[#a78bfa] bg-[#232136] text-white' : 'border-[#5330cf] bg-white text-[#5330cf]')
                                        : (theme === 'dark' ? 'border-[#27272a] bg-[#1e1e23] text-white hover:border-[#a78bfa] hover:bg-[#232136]/80 active:bg-[#181825]' : 'border-[#e0e7ff] bg-[#f8fafc] text-[#5330cf] hover:border-[#5330cf] hover:bg-[#ede9fe] active:bg-[#ede9fe]')
                                    }`}
                                onClick={() => {
                                    setShowChoosePath(false);
                                    // Create user for startFresh
                                    const id = uuidv4();
                                    addUser({
                                        id,
                                        name: "",
                                        type: "startFresh",
                                        hasCompletedOnboarding: false,
                                        educationLevel: undefined,
                                        interests: undefined,
                                        strengths: undefined,
                                        workPreferences: undefined,
                                        broadField: undefined,
                                        specificRole: undefined,
                                        chatHistory: [],
                                        roadmapItems: []
                                    });
                                    router.push("/start-fresh");
                                }}
                                style={{ boxShadow: selectedPath === "startFresh" ? (theme === 'dark' ? '0 0 0 3px #a78bfa55' : '0 0 0 3px #5330cf33') : undefined }}
                            >
                                <div className="space-y-4 flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200
                                        ${selectedPath === "startFresh"
                                            ? (theme === 'dark' ? 'bg-[#a78bfa]/30' : 'bg-[#ede9fe]')
                                            : (theme === 'dark' ? 'bg-[#232136]/60' : 'bg-[#f3f0ff]')
                                        }`}>
                                        {/* Start Fresh Icon: User Plus */}
                                        <svg className={selectedPath === "startFresh" ? 'h-7 w-7 text-[#a78bfa]' : 'h-7 w-7 text-[#5330cf]'} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 8v6M23 11h-6" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold">Start Fresh</h3>
                                    <p className="text-muted-foreground text-center">Begin your career journey from scratch. We'll help you discover your path based on your interests and goals.</p>
                                </div>
                            </Card>
                            <Card
                                className={`flex-1 p-6 cursor-pointer border-2 rounded-xl transition-all duration-200 shadow-md
                                    ${selectedPath === "resume"
                                        ? (theme === 'dark' ? 'border-[#a78bfa] bg-[#232136] text-white' : 'border-[#5330cf] bg-white text-[#5330cf]')
                                        : (theme === 'dark' ? 'border-[#27272a] bg-[#1e1e23] text-white hover:border-[#a78bfa] hover:bg-[#232136]/80 active:bg-[#181825]' : 'border-[#e0e7ff] bg-[#f8fafc] text-[#5330cf] hover:border-[#5330cf] hover:bg-[#ede9fe] active:bg-[#ede9fe]')
                                    }`}
                                onClick={() => {
                                    setShowChoosePath(false);
                                    // Create user for resume
                                    const id = uuidv4();
                                    addUser({
                                        id,
                                        name: "",
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
                                        chatHistory: [],
                                        roadmapItems: []
                                    });
                                    router.push("/resume-upload");
                                }}
                                style={{ boxShadow: selectedPath === "resume" ? (theme === 'dark' ? '0 0 0 3px #a78bfa55' : '0 0 0 3px #5330cf33') : undefined }}
                            >
                                <div className="space-y-4 flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200
                                        ${selectedPath === "resume"
                                            ? (theme === 'dark' ? 'bg-[#a78bfa]/30' : 'bg-[#ede9fe]')
                                            : (theme === 'dark' ? 'bg-[#232136]/60' : 'bg-[#f3f0ff]')
                                        }`}>
                                        {/* Resume Icon: File Text */}
                                        <svg className={selectedPath === "resume" ? 'h-7 w-7 text-[#a78bfa]' : 'h-7 w-7 text-[#5330cf]'} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                            <rect x="4" y="4" width="16" height="16" rx="2" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 13h6M8 17h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold">Upload Resume</h3>
                                    <p className="text-muted-foreground text-center">Already have a resume? Upload it and we'll analyze it to provide personalized career guidance.</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
