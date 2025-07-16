'use client'

import AppHeader from "@/components/header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-[#18122b] text-white flex flex-col">
            <AppHeader />
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-y-auto">
                <section className="max-w-2xl w-full mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
                    <Accordion type="multiple" className="space-y-4">
                        <AccordionItem value="q1">
                            <AccordionTrigger className="text-lg font-semibold">What is CareerBuilder.AI?</AccordionTrigger>
                            <AccordionContent className="text-white/80">
                                CareerBuilder.AI is an AI-powered platform that helps you plan, track, and achieve your career goals with personalized guidance, resume analysis, and actionable suggestions.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="q2">
                            <AccordionTrigger className="text-lg font-semibold">How does the resume analysis work?</AccordionTrigger>
                            <AccordionContent className="text-white/80">
                                Our AI analyzes your uploaded resume to identify your strengths, skills, and areas for improvement, then provides tailored suggestions and a career roadmap.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="q3">
                            <AccordionTrigger className="text-lg font-semibold">Is my data secure and private?</AccordionTrigger>
                            <AccordionContent className="text-white/80">
                                Yes, your data is securely stored and never shared with third parties. You have full control over your information at all times.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="q4">
                            <AccordionTrigger className="text-lg font-semibold">Can I use CareerBuilder.AI for free?</AccordionTrigger>
                            <AccordionContent className="text-white/80">
                                Yes, you can get started for free! Some advanced features may require a subscription in the future, but core guidance and analysis are always available.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="q5">
                            <AccordionTrigger className="text-lg font-semibold">How do I get personalized job or skill suggestions?</AccordionTrigger>
                            <AccordionContent className="text-white/80">
                                After uploading your resume or completing onboarding, our AI will recommend jobs, skills, courses, and projects tailored to your profile.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>
            </main>
        </div>
    );
}
