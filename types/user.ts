import { ChatMessage } from "@/types/chat"

export type UserProfileType = "startFresh" | "resume" | "generic"

export interface BaseUserProfile {
    id: string
    name: string
    type: UserProfileType
    hasCompletedOnboarding: boolean
    chatHistory: any[]
    roadmapItems?: RoadmapItem[]
}

export interface StartFreshProfile extends BaseUserProfile {
    type: "startFresh"
    educationLevel?: string
    interests?: string[]
    strengths?: string[]
    workPreferences?: string[]
    broadField?: string
    specificRole?: string
    chatHistory: ChatMessage[]
    roadmapItems?: RoadmapItem[]
}

export interface ResumeProfile extends BaseUserProfile {
    type: "resume"
    resumeText?: string
    resumeFileName?: string
    atsScore?: number
    skillsChart: any[]
    analysis: {
        atsScore?: number
        mostUsedSkills: string[]
        matchScore?: number
        sectionSuggestions: Record<string, string>
        improvementAreas: string[]
    }
    suggestions: {
        skillsToLearn: string[]
        relevantCourses: string[]
        certifications: string[]
        projectIdeas: string[]
        jobListings: any[]
    }
}

export type UserProfile = StartFreshProfile | ResumeProfile | (BaseUserProfile & { type: "generic" })

export interface RoadmapItem {
    id: string
    title: string
    description: string
    status: "not_started" | "in_progress" | "done"
    difficulty: "easy" | "medium" | "hard"
} 