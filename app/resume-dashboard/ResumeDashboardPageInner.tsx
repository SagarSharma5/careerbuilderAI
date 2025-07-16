import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppState } from "@/components/providers/app-state-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import Loading from "@/components/loading"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useTheme } from "next-themes"
import type { ResumeProfile } from "@/types/user"
import { JobSuggestions } from "@/components/resume-dashboard/JobSuggestions"
import InfoModal from "@/components/resume-dashboard/InfoModal"

export function ResumeDashboardPageInner() {
    const router = useRouter()
    const { currentUser, isRestoringSession } = useAppState()
    const [isAnalyzing, setIsAnalyzing] = useState(true)
    const [analysis, setAnalysis] = useState<any>(null)
    const [analysisError, setAnalysisError] = useState<string | null>(null)
    const [showSuggestionModal, setShowSuggestionModal] = useState(false)
    const [suggestionContent, setSuggestionContent] = useState<{ title: string; description: string }[] | null>(null)
    const [modalTitle, setModalTitle] = useState("")
    const [chatInput, setChatInput] = useState("")
    const [chatHistory, setChatHistory] = useState<{ type: "user" | "ai", message: string }[]>([])
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const { resolvedTheme } = useTheme()
    const isLight = resolvedTheme === 'light';
    const [selectedSuggestion, setSelectedSuggestion] = useState<{ type: keyof ResumeProfile["suggestions"]; value: string } | null>(null)
    const [selectedJob, setSelectedJob] = useState<any | null>(null)
    const [infoModalContent, setInfoModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

    const jobSuggestionsCache = useRef<{ [key: string]: any[] }>({});
    const [cachedJobsForModal, setCachedJobsForModal] = useState<any[] | null>(null);

    const [readyToRedirect, setReadyToRedirect] = useState(false);
    useEffect(() => {
        if (!isRestoringSession && !currentUser) {
            const timeout = setTimeout(() => setReadyToRedirect(true), 50);
            return () => clearTimeout(timeout);
        } else {
            setReadyToRedirect(false);
        }
    }, [isRestoringSession, currentUser]);

    useEffect(() => {
        if (readyToRedirect && !currentUser) {
            router.replace("/");
        }
    }, [readyToRedirect, currentUser, router]);

    useEffect(() => {
        if (!isRestoringSession && currentUser && currentUser.type === "resume") {
            const resumeUser = currentUser as ResumeProfile
            if (!resumeUser.analysis) {
                setIsAnalyzing(false)
                setAnalysisError("No analysis found. Please upload your resume.")
                return
            }
            setIsAnalyzing(false)
            setAnalysis(resumeUser.analysis)
        }
    }, [currentUser, router, isRestoringSession])

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chatHistory])

    useEffect(() => {
        if (chatHistory.length > 0 && inputRef.current) {
            inputRef.current.focus()
        }
    }, [chatHistory.length])
    useEffect(() => {
        if (!showSuggestionModal) {
            setSelectedSuggestion(null);
        }
    }, [showSuggestionModal]);

    const handleSuggestionClick = (type: keyof ResumeProfile["suggestions"], label: string) => {
        setModalTitle(label);
        if (label === "Jobs") {
            const key = `${inferredJobTitle}__${inferredLocation}`;
            if (jobSuggestionsCache.current[key]) {
                setCachedJobsForModal(jobSuggestionsCache.current[key]);
            } else {
                setCachedJobsForModal(null);
            }
            setSuggestionContent(null);
        } else {
            setSuggestionContent(analysis.suggestions[type]);
        }
        setShowSuggestionModal(true);
    }

    const handleSendMessage = () => {
        if (chatInput.trim()) {
            setChatHistory(prev => [...prev, { type: "user", message: chatInput.trim() }])
            setChatInput("")
            setTimeout(() => {
                setChatHistory(prev => [...prev, { type: "ai", message: "This is a mock AI response to your question." }])
                requestAnimationFrame(() => {
                    inputRef.current?.focus()
                })
            }, 1000)
        }
    }

    const handleGoToChatbot = () => {
        router.push('/chatbot');
    }

    if (isRestoringSession) {
        return <Loading message="Restoring session..." />
    }
    if (!currentUser || currentUser.type !== "resume") {
        return <Loading message="Loading profile..." />
    }
    if (isAnalyzing) {
        return <Loading message="Analyzing your resume..." />
    }
    if (analysisError) {
        return <div className="text-center text-red-500 mt-8">{analysisError}</div>
    }

    const suggestionGridItems: { label: string; type: keyof ResumeProfile["suggestions"] }[] = [
        { label: "Skills", type: "skillsToLearn" },
        { label: "Jobs", type: "jobListings" },
        { label: "Projects", type: "projectIdeas" },
        { label: "Courses", type: "relevantCourses" },
        { label: "Certifications", type: "certifications" }
    ];

    const inferredJobTitle = analysis?.jobTitle || analysis?.topSkills?.[0]?.name || "NodeJS Developer";
    const inferredLocation = analysis?.location || "New York";
    const inferredCountryCode = analysis?.countryCode || "";

    const openSkillsModal = () => {
        setInfoModalContent({
            title: "Top Skills",
            content: (
                <ul className="space-y-2">
                    {analysis.topSkills.map((skill: { name: string; value: number; color: string }, index: number) => (
                        <li key={index} className="flex items-center">
                            <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: skill.color }} />
                            <span>{skill.name}</span>
                            <span className="ml-auto font-semibold">{skill.value}%</span>
                        </li>
                    ))}
                </ul>
            )
        });
    };

    const openAnalysisModal = () => {
        setInfoModalContent({
            title: "Deep Analysis",
            content: (
                <div className="flex flex-row gap-6">
                    <div className="flex flex-col flex-1 justify-center">
                        <ul className="space-y-2 text-base">
                            {analysis.detailedAnalysis.map((item: string, index: number) => (
                                <li key={index} className="flex items-start">
                                    <span className={`${isLight ? 'text-blue-600' : 'text-blue-400'} mr-2 mt-1`}>◆</span>
                                    <span className={`${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-1 items-center justify-center min-h-[300px]">
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.resumeMetrics}>
                                <PolarGrid stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: isLight ? '#111' : '#eee', fontSize: 14 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Metrics" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )
        });
    };

    return (
        <div className="w-full flex flex-col flex-1 mb:overflow-hidden px-4 pt-2" style={{ height: 'calc(100vh - 6rem)', boxSizing: 'border-box' }}>
            <div className="flex flex-col flex-1 mb:overflow-y-hidden">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 flex-shrink-0 select-none"
                >
                    <h1 className={`text-3xl font-bold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>Resume Analysis</h1>
                    <p className={`${isLight ? 'text-gray-700' : 'text-white/80'} mt-1`}>Your personalized resume insights and recommendations.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-1 flex-col gap-4 mb-8 select-none"
                >
                    <div className="flex flex-col gap-4 flex-1 min-h-0 md:grid md:grid-cols-3 md:gap-4">
                        <div className="w-full md:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="flex flex-col w-full h-full"
                            >
                                <Card
                                    className={`flex flex-col flex-1 cursor-pointer ${isLight ? 'bg-gradient-to-br from-indigo-100/80 to-purple-100/80 border-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.10)] hover:shadow-[0_0_25px_rgba(99,102,241,0.18)]' : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.35)]'} backdrop-blur-sm transition-all duration-300`}
                                    onClick={openSkillsModal}
                                >
                                    <CardHeader className="h-12 flex-shrink-0 flex items-center">
                                        <CardTitle className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'} -mt-1`}>Top Skills</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-1 items-center justify-center p-4 pb-6">
                                        <div className="flex flex-row flex-1 items-center justify-between gap-6 overflow-hidden">
                                            <div className="flex-1 flex items-center justify-center min-h-[200px]">
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <PieChart>
                                                        <Pie
                                                            data={analysis.topSkills}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            outerRadius={90}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            animationDuration={1500}
                                                            animationBegin={0}
                                                            isAnimationActive={true}
                                                            activeIndex={undefined}
                                                            activeShape={undefined}
                                                            className="outline-none"
                                                        >
                                                            {analysis.topSkills.map((entry: { name: string; value: number; color: string }, index: number) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={entry.color}
                                                                    className="outline-none"
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(255, 255, 255, 0.9)',
                                                                color: isLight ? '#222' : undefined,
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex flex-col justify-center space-y-3 pr-2 w-2/5">
                                                {analysis.topSkills.map((skill: { name: string; value: number; color: string }, index: number) => (
                                                    <motion.div
                                                        key={skill.name}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                                        className="flex items-center space-x-3 w-full"
                                                        style={{ minHeight: '1.5em' }}
                                                    >
                                                        <div
                                                            className="w-4 h-4 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: skill.color }}
                                                        />
                                                        <div className="flex-grow min-w-0">
                                                            <span
                                                                className={`block font-medium truncate ${isLight ? 'text-gray-900' : 'text-white'}`}
                                                                style={{
                                                                    fontSize: '0.75rem',
                                                                    lineHeight: 1.1,
                                                                    maxWidth: '100%',
                                                                    wordBreak: 'break-all',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                                title={skill.name}
                                                            >
                                                                {skill.name}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={`${isLight ? 'text-gray-700' : 'text-white/60'} font-medium`}
                                                            style={{ fontSize: '0.75rem' }}
                                                        >
                                                            {skill.value}%
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col flex-1 h-full mt-4 md:mt-0 md:col-span-2"
                        >
                            <Card
                                className={`flex flex-col flex-1 cursor-pointer ${isLight ? 'bg-gradient-to-br from-blue-100/80 to-cyan-100/80 border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.10)] hover:shadow-[0_0_25px_rgba(59,130,246,0.18)]' : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]'} backdrop-blur-sm transition-all duration-300`}
                                onClick={openAnalysisModal}
                            >
                                <CardHeader className="h-12 flex-shrink-0 flex items-center">
                                    <CardTitle className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'} -mt-1`}>Deep Analysis</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-row gap-6 p-4">
                                    <div className="flex flex-col flex-1 min-h-[220px] max-h-full justify-center">
                                        <ul className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar space-y-1 text-sm">
                                            {analysis.detailedAnalysis.slice(0, 6).map((item: string, index: number) => (
                                                <motion.li
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.1 * index }}
                                                    className="flex items-start group"
                                                >
                                                    <span className={`${isLight ? 'text-blue-600' : 'text-white'} mr-1.5 group-hover:scale-110 transition-transform`}>•</span>
                                                    <span className={`${isLight ? 'text-gray-800 group-hover:text-blue-700' : 'text-white/90 group-hover:text-white'} transition-colors leading-tight`}>{item}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex flex-1 items-center justify-center min-h-[220px]">
                                        <ResponsiveContainer width="100%" height={220}>
                                            <RadarChart cx="50%" cy="50%" outerRadius="90%" data={analysis.resumeMetrics}>
                                                <PolarGrid
                                                    stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)'}
                                                    strokeDasharray="3 3"
                                                />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{
                                                        fill: isLight ? '#222' : 'white',
                                                        fontSize: 11,
                                                        fontWeight: 500
                                                    }}
                                                    stroke={isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.3)'}
                                                />
                                                <PolarRadiusAxis
                                                    angle={30}
                                                    domain={[0, 100]}
                                                    tick={false}
                                                    stroke={isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.3)'}
                                                    axisLine={false}
                                                />
                                                <Radar
                                                    name="Resume Metrics"
                                                    dataKey="A"
                                                    stroke={isLight ? '#6366f1' : '#3b82f6'}
                                                    fill={isLight ? '#6366f1' : '#3b82f6'}
                                                    fillOpacity={0.15}
                                                    strokeWidth={2}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(255, 255, 255, 0.95)',
                                                        color: isLight ? '#222' : undefined,
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                        padding: '8px 12px'
                                                    }}
                                                    formatter={(value: number) => [`${value}%`, 'Score']}
                                                    labelStyle={{ color: isLight ? '#222' : '#1e293b', fontWeight: 500 }}
                                                    itemStyle={{ color: isLight ? '#6366f1' : '#3b82f6' }}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                    <div className="flex flex-col gap-4 mt-4 md:mt-0 md:grid md:grid-cols-3 md:gap-4 flex-1 min-h-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="w-full md:col-span-2 flex flex-col h-full"
                        >
                            <Card className={`h-full flex flex-col ${isLight ? 'bg-gradient-to-br from-purple-100/80 to-pink-100/80 border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.10)] hover:shadow-[0_0_25px_rgba(168,85,247,0.18)]' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:shadow-[0_0_35px_rgba(168,85,247,0.55)]'} backdrop-blur-sm transition-all duration-300`}>
                                <CardHeader className="h-12 flex-shrink-0 flex items-center">
                                    <CardTitle className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'} -mt-1`}>Smart Suggestions</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 p-4">
                                    <div className="grid grid-cols-3 gap-3 h-full">
                                        {suggestionGridItems.map((item, index) => {
                                            let IconComponent = null;
                                            let iconClass = '';
                                            let iconBg = '';
                                            switch (item.type) {
                                                case 'skillsToLearn':
                                                    IconComponent = require('lucide-react').Sparkles;
                                                    iconClass = isLight ? 'text-indigo-500' : 'text-indigo-300';
                                                    iconBg = isLight ? 'bg-indigo-100/80' : 'bg-indigo-700/30';
                                                    break;
                                                case 'jobListings':
                                                    IconComponent = require('lucide-react').Briefcase;
                                                    iconClass = isLight ? 'text-emerald-500' : 'text-emerald-300';
                                                    iconBg = isLight ? 'bg-emerald-100/80' : 'bg-emerald-700/30';
                                                    break;
                                                case 'projectIdeas':
                                                    IconComponent = require('lucide-react').Lightbulb;
                                                    iconClass = isLight ? 'text-yellow-500' : 'text-yellow-300';
                                                    iconBg = isLight ? 'bg-yellow-100/80' : 'bg-yellow-700/30';
                                                    break;
                                                case 'relevantCourses':
                                                    IconComponent = require('lucide-react').BookOpen;
                                                    iconClass = isLight ? 'text-pink-500' : 'text-pink-300';
                                                    iconBg = isLight ? 'bg-pink-100/80' : 'bg-pink-700/30';
                                                    break;
                                                case 'certifications':
                                                    IconComponent = require('lucide-react').Award;
                                                    iconClass = isLight ? 'text-cyan-500' : 'text-cyan-300';
                                                    iconBg = isLight ? 'bg-cyan-100/80' : 'bg-cyan-700/30';
                                                    break;
                                                default:
                                                    IconComponent = require('lucide-react').Sparkles;
                                                    iconClass = isLight ? 'text-indigo-500' : 'text-indigo-300';
                                                    iconBg = isLight ? 'bg-indigo-100/80' : 'bg-indigo-700/30';
                                            }
                                            return (
                                                <motion.div
                                                    key={item.label}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    whileHover={{
                                                        scale: 1.04,
                                                        transition: { duration: 0.2, ease: "easeInOut" }
                                                    }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleSuggestionClick(item.type, item.label)}
                                                    className={`smart-suggestion-card flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br ${isLight ? 'from-indigo-200 to-purple-200 text-gray-900' : 'from-indigo-600 to-purple-600 text-white'} hover:from-indigo-300 hover:to-purple-300 transition-all duration-300 cursor-pointer text-center text-sm font-medium shadow-lg hover:shadow-xl relative overflow-hidden`}
                                                    style={item.label === "Jobs" ? { gridColumn: "span 1", gridRow: "span 2" } : {}}
                                                    tabIndex={0}
                                                >
                                                    <span className={`flex items-center justify-center rounded-full mb-2 ${iconBg}`} style={{ width: 38, height: 38 }}>
                                                        {IconComponent && <IconComponent className={`w-7 h-7 ${iconClass}`} />}
                                                    </span>
                                                    <span className="text-base font-semibold mb-1">{item.label}</span>
                                                    <span className={`text-xs ${isLight ? 'text-gray-700' : 'text-white/70'} font-normal`}>
                                                        {item.type === 'skillsToLearn' ? 'Grow your skillset' :
                                                            item.type === 'jobListings' ? 'Curated jobs for you' :
                                                                item.type === 'projectIdeas' ? 'Project ideas to build' :
                                                                    item.type === 'relevantCourses' ? 'Courses to upskill' :
                                                                        item.type === 'certifications' ? 'Certifications to earn' : ''}
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <div className="w-full flex flex-col gap-4 md:col-span-1 md:grid md:grid-rows-[auto_1fr] md:gap-3 h-full">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.35 }}
                            >
                                <Card className={`${isLight ? 'bg-gradient-to-br from-blue-100/80 to-cyan-100/80 border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.10)] hover:shadow-[0_0_25px_rgba(59,130,246,0.18)]' : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]'} backdrop-blur-sm transition-all duration-300`}>
                                    <CardContent className="flex flex-col justify-center p-4 gap-y-2">
                                        <div className="flex items-center justify-between w-full">
                                            <span className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>ATS Score</span>
                                            <span className={`text-2xl font-extrabold ml-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>{analysis.atsScore}%</span>
                                        </div>
                                        <div className={`h-2.5 w-full rounded-full overflow-hidden ${isLight ? 'bg-gray-200' : 'bg-white/20'}`}>
                                            <div
                                                className={`h-full transition-all duration-500 ${isLight ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                                                style={{ width: `${analysis.atsScore}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="min-h-0"
                            >
                                <Card className={`h-full flex flex-col ${isLight ? 'bg-gradient-to-br from-emerald-100/80 to-teal-100/80 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.10)] hover:shadow-[0_0_25px_rgba(16,185,129,0.18)]' : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]'} backdrop-blur-sm transition-all duration-300`}>
                                    <CardHeader className="flex-shrink-0 pb-2 items-center">
                                        <CardTitle className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Ask anything...</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-center items-center p-4 min-h-0">
                                        <div className="flex items-center justify-center mb-2">
                                            <Send className={`h-10 w-10 ${isLight ? 'text-emerald-500' : 'text-emerald-300'} animate-bounce`} />
                                        </div>
                                        <div className={`text-center text-base font-medium ${isLight ? 'text-gray-900' : 'text-white/90'} mb-4`}>
                                            Want to chat with our AI Career Copilot?
                                        </div>
                                        <Button
                                            onClick={handleGoToChatbot}
                                            className={`px-6 py-2 rounded-lg shadow-lg transition-all duration-200 text-base font-semibold ${isLight ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white hover:from-emerald-500 hover:to-teal-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'}`}
                                            size="lg"
                                        >
                                            Go to Chatbot
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Dialog open={showSuggestionModal} onOpenChange={(open) => {
                setShowSuggestionModal(open);
                if (!open) {
                    setCachedJobsForModal(null);
                    setSelectedJob(null);
                }
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                >
                    <DialogContent className="max-w-[70vw] w-[70vw] h-[70vh] bg-card/95 backdrop-blur-sm border-muted/30 shadow-2xl flex flex-col overflow-hidden select-none">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-card-foreground">{modalTitle}</DialogTitle>
                        </DialogHeader>
                        <AnimatePresence mode="wait">
                            {modalTitle === "Jobs" ? (
                                selectedJob ? (
                                    <motion.div
                                        key="job-detail"
                                        className="flex-1 flex flex-col h-full w-full p-0 select-text"
                                        initial={{ borderRadius: 24 }}
                                        animate={{ borderRadius: 24 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                                        style={{ zIndex: 10 }}
                                    >
                                        <Card className={`h-full flex flex-col ${isLight ? 'bg-gradient-to-br from-purple-100/80 to-pink-100/80 border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.10)] hover:shadow-[0_0_25px_rgba(168,85,247,0.18)]' : 'bg-black'} border border-primary-200 dark:border-primary-700 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer group`}>
                                            <div className="flex items-center p-6 border-b border-primary-200 dark:border-primary-700">
                                                <Button onClick={() => setSelectedJob(null)} className="mr-4" variant="outline" size="icon" aria-label="Back">
                                                    ←
                                                </Button>
                                                <CardTitle className="text-2xl font-bold text-center w-full">
                                                    {selectedJob.title || selectedJob.job_title}
                                                </CardTitle>
                                            </div>
                                            <CardContent className="flex-1 flex items-center justify-center p-8">
                                                <div className={`text-xl text-center space-y-2 ${resolvedTheme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
                                                    <div><span className="font-semibold">Location:</span> {selectedJob.job_city || selectedJob.job_state || selectedJob.job_country ? `${selectedJob.job_city || ''}${selectedJob.job_city && selectedJob.job_state ? ', ' : ''}${selectedJob.job_state || ''}${(selectedJob.job_city || selectedJob.job_state) && selectedJob.job_country ? ', ' : ''}${selectedJob.job_country || ''}` : '-'}</div>
                                                    {selectedJob.employer_name && <div><span className="font-semibold">Company:</span> {selectedJob.employer_name}</div>}
                                                    {(selectedJob.job_min_salary || selectedJob.job_max_salary) && (
                                                        <div><span className="font-semibold">Salary:</span> {selectedJob.job_min_salary ? `${selectedJob.job_min_salary}` : '-'}{selectedJob.job_max_salary ? ` - ${selectedJob.job_max_salary}` : ''} {selectedJob.job_salary_currency || ''}</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ) : (
                                    <div className="flex-1 h-full w-full">
                                        <JobSuggestions
                                            jobTitle={inferredJobTitle}
                                            location={inferredLocation}
                                            countryCode={inferredCountryCode}
                                            cachedJobs={cachedJobsForModal}
                                            onJobsFetched={(jobs) => {
                                                const key = `${inferredJobTitle}__${inferredLocation}`;
                                                if (!jobSuggestionsCache.current[key] || jobSuggestionsCache.current[key].length === 0) {
                                                    jobSuggestionsCache.current[key] = jobs;
                                                    setCachedJobsForModal(jobs);
                                                }
                                            }}
                                            renderCards={(jobs: any[] = []) => {
                                                const isDark = resolvedTheme === 'dark';
                                                const cards = jobs.slice(0, 9);
                                                const placeholders = Array(9 - cards.length).fill(null);
                                                return (
                                                    <div className="grid grid-cols-3 grid-rows-3 gap-6 h-full w-full">
                                                        {[...cards, ...placeholders].map((job, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.18, ease: 'easeOut', delay: idx * 0.05 }}
                                                                whileHover={{ scale: 1.05, transition: { duration: 0.2, ease: "easeInOut" } }}
                                                                whileTap={{ scale: 1, transition: { duration: 0.12, ease: 'easeInOut' } }}
                                                                className="h-full w-full flex"
                                                                onClick={() => job && setSelectedJob(job)}
                                                            >
                                                                <Card className={`h-full w-full flex flex-col ${isLight ? 'bg-gradient-to-br from-purple-100/80 to-pink-100/80 border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.10)] hover:shadow-[0_0_25px_rgba(168,85,247,0.18)]' : 'bg-black'} border border-primary-200 dark:border-primary-700 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer group`}>
                                                                    <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
                                                                        {job ? (
                                                                            <>
                                                                                <CardDescription
                                                                                    className={`text-center text-xl font-semibold transition-colors ${isDark ? 'text-zinc-100' : 'text-zinc-900'} truncate max-w-full`}
                                                                                    title={job.title || job.job_title}
                                                                                >
                                                                                    {(job.title || job.job_title)?.length > 32
                                                                                        ? (job.title || job.job_title).slice(0, 29) + '...'
                                                                                        : job.title || job.job_title}
                                                                                </CardDescription>
                                                                                <div className={`mt-2 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{job.employer_name || job.company || job.company_name || ''}</div>
                                                                            </>
                                                                        ) : (
                                                                            <span className="opacity-30 text-card-foreground/60 text-center text-3xl">&mdash;</span>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                );
                                            }}
                                        />
                                    </div>
                                )
                            ) : !selectedSuggestion ? (
                                <motion.div key="grid" className="flex-1 h-full w-full">
                                    <div className="grid grid-cols-3 grid-rows-3 gap-6 h-full w-full">
                                        {(Array.isArray(suggestionContent)
                                            ? [
                                                ...suggestionContent.slice(0, 9),
                                                ...Array(Math.max(0, 9 - suggestionContent.length)).fill(null)
                                            ]
                                            : Array(9).fill(null)
                                        ).map((item, index) => {
                                            const isDark = resolvedTheme === 'dark';
                                            const layoutId = item ? `suggestion-card-${modalTitle.split(' ')[0]}-${item.title}` : undefined;
                                            const isHidden = selectedSuggestion && (!item || item.title !== (selectedSuggestion as { value: string })?.value);
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: isHidden ? 0 : 1, y: isHidden ? 0 : 0 }}
                                                    transition={{ duration: isHidden ? 0 : 0.18, ease: 'easeOut', delay: index * 0.05 }}
                                                    style={{ display: isHidden ? 'none' : undefined }}
                                                    whileHover={{ scale: 1.05, transition: { duration: 0.2, ease: "easeInOut" } }}
                                                    whileTap={{ scale: 1, transition: { duration: 0.12, ease: 'easeInOut' } }}
                                                    className="h-full flex"
                                                    onClick={() => item && setSelectedSuggestion({ type: (modalTitle.split(' ')[0].toLowerCase() as keyof ResumeProfile["suggestions"]), value: item.title })}
                                                    layoutId={layoutId}
                                                >
                                                    <Card className={`h-full w-full flex flex-col ${isLight ? 'bg-gradient-to-br from-purple-100/80 to-pink-100/80 border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.10)] hover:shadow-[0_0_25px_rgba(168,85,247,0.18)]' : 'bg-black'} border border-primary-200 dark:border-primary-700 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer group`}>
                                                        <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
                                                            {item ? (
                                                                <>
                                                                    <CardDescription className={`text-center text-xl font-semibold transition-colors ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                                                                        {item.title}
                                                                    </CardDescription>
                                                                </>
                                                            ) : (
                                                                <span className="opacity-30 text-card-foreground/60 text-center">&mdash;</span>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="detail"
                                    className="flex-1 flex flex-col h-full w-full p-0"
                                    layoutId={
                                        selectedSuggestion
                                            ? `suggestion-card-${selectedSuggestion.type.charAt(0).toUpperCase() + selectedSuggestion.type.slice(1)}-${selectedSuggestion.value}`
                                            : undefined
                                    }
                                    initial={{ borderRadius: 24 }}
                                    animate={{ borderRadius: 24 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                                    style={{ zIndex: 10 }}
                                >
                                    <Card className={`h-full flex flex-col ${isLight ? 'bg-gradient-to-br from-purple-100/80 to-pink-100/80 border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.10)] hover:shadow-[0_0_25px_rgba(168,85,247,0.18)]' : 'bg-black'} border border-primary-200 dark:border-primary-700 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer group`}>
                                        <div className="flex items-center p-6 border-b border-primary-200 dark:border-primary-700">
                                            <Button onClick={() => setSelectedSuggestion(null)} className="mr-4" variant="outline" size="icon" aria-label="Back">
                                                ←
                                            </Button>
                                            <CardTitle className="text-2xl font-bold text-center w-full">
                                                {selectedSuggestion ? selectedSuggestion.value : ''}
                                            </CardTitle>
                                        </div>
                                        <CardContent className="flex-1 flex items-center justify-center p-8">
                                            <p className={`text-xl text-center ${resolvedTheme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
                                                {selectedSuggestion
                                                    ? suggestionContent?.find((s) => s?.title === selectedSuggestion.value)?.description || 'No details available.'
                                                    : 'No details available.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </DialogContent>
                </motion.div>
            </Dialog>

            <InfoModal
                isOpen={!!infoModalContent}
                onClose={() => setInfoModalContent(null)}
                title={infoModalContent?.title || ""}
            >
                {infoModalContent?.content}
            </InfoModal>

            <style jsx global>{`
.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(120,120,120,0.18) transparent;
}
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(120,120,120,0.18);
    border-radius: 4px;
}
.smart-suggestion-card:focus {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
}
.dark .smart-suggestion-card:hover,
.dark .smart-suggestion-card:focus:hover {
    background: rgba(76, 29, 149, 0.22) !important;
    box-shadow: 0 8px 32px #4c1d9533 !important;
}
`}</style>
        </div>
    );
}