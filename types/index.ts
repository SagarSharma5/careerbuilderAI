export type UserProfileType = "startFresh" | "resume" | "generic"

export interface BaseUserProfile {
    id: string
    name: string
    type: UserProfileType
    hasCompletedOnboarding: boolean
    chatHistory: any[]
    roadmapItems?: RoadmapItem[]
}

export interface RoadmapItem {
    id: string
    title: string
    description: string
    status: "not_started" | "in_progress" | "done"
    difficulty?: "easy" | "medium" | "hard"
}

export interface StartFreshProfile extends BaseUserProfile {
    type: "startFresh"
    educationLevel?: string
    interests?: string[]
    strengths?: string[]
    workPreferences?: string[] // e.g., "remote", "field"
    broadField?: string
    specificRole?: string
    chatHistory: ChatMessage[]
    roadmap?: {
        tasks: Array<{
            id: string
            title: string
            description: string
            difficulty: 'easy' | 'medium' | 'hard'
            status: 'todo' | 'inProgress' | 'done'
        }>
    }
    lastStep?: number // Track last visited step in onboarding
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
        jobListings: (string | JobListing)[]
    }
}

export type UserProfile = StartFreshProfile | ResumeProfile | (BaseUserProfile & { type: "generic" })

export interface Task {
    id: string
    title: string
    description?: string
    difficulty: "easy" | "medium" | "hard"
    category?: string // e.g., "Learning", "Project"
}

export interface JobListing {
    id: string
    title: string
    company: string
    location: string
    url: string
    description?: string
}

export interface ChatMessage {
    id: string
    sender: "user" | "ai"
    text: string
    timestamp: number
}

export interface AppState {
    users: Record<string, UserProfile>
    currentUser?: string // ID of the current user
}
