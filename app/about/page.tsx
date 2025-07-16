'use client'

import AppHeader from "@/components/header";
import { Briefcase, Sparkles, Users, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#18122b] text-white flex flex-col">
            <AppHeader />
            <main
                className="flex-1 flex flex-col items-center justify-center px-2"
                style={{ minHeight: 'calc(100vh - 6rem)', maxHeight: 'calc(100vh - 6rem)', height: 'calc(100vh - 6rem)' }}
            >
                <section className="max-w-3xl w-full mx-auto flex flex-col gap-4 h-full justify-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-center drop-shadow-lg leading-tight mb-2">About CareerBuilder.AI</h1>
                    <p className="text-base md:text-lg text-center text-white/80 mb-2">
                        CareerBuilder.AI is your personal AI-powered career guide, designed to help you discover, plan, and achieve your professional goals. Our platform leverages advanced AI to analyze your skills, interests, and experience, providing personalized roadmaps, resume analysis, and actionable suggestions.
                    </p>
                    <div className="flex flex-col gap-3 flex-1 justify-center">
                        <div className="flex flex-col md:flex-row gap-4 items-center bg-white/10 rounded-2xl shadow-lg p-4 border border-[#a78bfa]/30 min-h-0">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-6 h-6 text-[#a78bfa]" />
                                    <h2 className="text-xl font-semibold">Our Mission</h2>
                                </div>
                                <p className="text-white/80 text-sm md:text-base">Empower individuals to take control of their career journey with clarity, confidence, and actionable insights—no matter their background or experience level.</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row-reverse gap-4 items-center bg-white/10 rounded-2xl shadow-lg p-4 border border-[#a78bfa]/30 min-h-0">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Briefcase className="w-6 h-6 text-[#a78bfa]" />
                                    <h2 className="text-xl font-semibold">What We Offer</h2>
                                </div>
                                <ul className="list-disc pl-5 text-white/80 space-y-1 text-sm md:text-base">
                                    <li>Personalized career roadmaps and milestones</li>
                                    <li>Resume analysis and improvement suggestions</li>
                                    <li>AI-powered job and skill recommendations</li>
                                    <li>Interactive Kanban and List views for tracking progress</li>
                                    <li>Modern, accessible, and visually engaging UI</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-center bg-white/10 rounded-2xl shadow-lg p-4 border border-[#a78bfa]/30 min-h-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-6 h-6 text-[#a78bfa]" />
                                <h2 className="text-xl font-semibold">Our Values</h2>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <span className="px-3 py-1 rounded-full bg-[#a78bfa]/20 border border-[#a78bfa] text-[#a78bfa] font-medium flex items-center gap-1 text-xs md:text-sm"><ShieldCheck className="w-4 h-4" />Empowerment</span>
                                <span className="px-3 py-1 rounded-full bg-[#a78bfa]/20 border border-[#a78bfa] text-[#a78bfa] font-medium flex items-center gap-1 text-xs md:text-sm"><ShieldCheck className="w-4 h-4" />Inclusivity</span>
                                <span className="px-3 py-1 rounded-full bg-[#a78bfa]/20 border border-[#a78bfa] text-[#a78bfa] font-medium flex items-center gap-1 text-xs md:text-sm"><ShieldCheck className="w-4 h-4" />Innovation</span>
                                <span className="px-3 py-1 rounded-full bg-[#a78bfa]/20 border border-[#a78bfa] text-[#a78bfa] font-medium flex items-center gap-1 text-xs md:text-sm"><ShieldCheck className="w-4 h-4" />Transparency</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
