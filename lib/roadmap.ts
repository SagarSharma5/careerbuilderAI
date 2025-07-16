import { UserProfile } from "../types/user"
import { RoadmapItem } from "../types/roadmap"

export function generateRoadmap(user: UserProfile): RoadmapItem[] {
    const baseRoadmap: RoadmapItem[] = [
        {
            id: "profile-setup",
            title: "Complete Profile Setup",
            description: "Fill out your profile with your interests, experience, and goals.",
            status: "not_started",
            difficulty: "easy"
        },
        {
            id: "research-companies",
            title: "Research Target Companies",
            description: "Identify and research companies that align with your career goals.",
            status: "not_started",
            difficulty: "medium"
        },
        {
            id: "update-resume",
            title: "Update Resume",
            description: "Update your resume based on the analysis and recommendations.",
            status: "not_started",
            difficulty: "medium"
        },
        {
            id: "network",
            title: "Network Building",
            description: "Start building your professional network through LinkedIn and industry events.",
            status: "not_started",
            difficulty: "hard"
        },
        {
            id: "skill-dev",
            title: "Skill Development",
            description: "Focus on developing key skills identified in your analysis.",
            status: "not_started",
            difficulty: "medium"
        }
    ]

    if (user.type === "startFresh") {
        return [
            ...baseRoadmap,
            {
                id: "explore-interests",
                title: "Explore Career Interests",
                description: "Research and explore different career paths based on your interests.",
                status: "not_started",
                difficulty: "easy"
            },
            {
                id: "skill-assessment",
                title: "Skill Assessment",
                description: "Take skill assessments to identify your strengths and areas for improvement.",
                status: "not_started",
                difficulty: "medium"
            }
        ]
    }

    return [
        ...baseRoadmap,
        {
            id: "resume-optimization",
            title: "Resume Optimization",
            description: "Optimize your resume based on ATS analysis and industry best practices.",
            status: "not_started",
            difficulty: "medium"
        },
        {
            id: "interview-prep",
            title: "Interview Preparation",
            description: "Prepare for interviews by practicing common questions and scenarios.",
            status: "not_started",
            difficulty: "hard"
        }
    ]
} 