import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { RoadmapItem } from "@/types/roadmap"

export async function POST(req: NextRequest) {
    const { educationLevel, interests, strengths, workPreferences, broadField, specificRole } = await req.json()
    const apiKey = process.env.GROQ_API_KEY_TASKS

    if (!apiKey) {
        return NextResponse.json({ error: "Missing Groq API key." }, { status: 500 })
    }

    const systemMessage = {
        role: "system",
        content: `You are a career roadmap generator. Create a step-by-step career roadmap based on the user's profile.
        Each task should be actionable and specific. Include a mix of learning, networking, and practical tasks.
        Order tasks logically from foundational to advanced steps.
        
        Generate exactly 3 main tasks. Each main task MUST have between 6 and 8 subtasks.
        
        Return a JSON array of tasks. Each task MUST have these exact fields:
        {
            "id": "unique-string-id",
            "title": "clear actionable title",
            "description": "detailed description",
            "status": "not_started",
            "difficulty": "easy" or "medium" or "hard",
            "subtasks": [
                {
                    "id": "unique-subtask-id",
                    "label": "subtask description",
                    "done": false
                }
            ]
        }
        Ensure all subtasks have a unique ID and are initially set to done: false.`
    }

    const userMessage = {
        role: "user",
        content: `Generate a career roadmap for someone with:
        - Education Level: ${educationLevel}
        - Interests: ${interests.join(', ')}
        - Strengths: ${strengths.join(', ')}
        - Work Preferences: ${workPreferences.join(', ')}
        - Target Field: ${broadField}
        - Target Role: ${specificRole}

        Return a JSON array of 3 tasks, each with 6-8 subtasks, following the exact format specified.`
    }

    const HF_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
    const url = `https://api.groq.com/openai/v1/chat/completions`

    try {
        const response = await axios.post(url, {
            model: HF_MODEL,
            messages: [systemMessage, userMessage],
            response_format: { type: "json_object" }
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        })

        let tasks: RoadmapItem[] = []
        try {
            const content = response.data.choices?.[0]?.message?.content
            if (typeof content === 'string') {
                const parsed = JSON.parse(content)
                const rawTasks = Array.isArray(parsed) ? parsed : parsed.tasks || []

                tasks = rawTasks.map((task: any, index: number): RoadmapItem => ({
                    id: task.id || `task-${index}`,
                    title: task.title || 'Untitled Task',
                    description: task.description || 'No description provided',
                    status: task.status || 'not_started',
                    difficulty: task.difficulty || 'medium',
                    subtasks: (task.subtasks || []).map((subtask: any, subIndex: number) => ({
                        id: subtask.id || `subtask-${index}-${subIndex}`,
                        label: subtask.label || 'Untitled Subtask',
                        done: subtask.done || false,
                    })),
                }))
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError)
            return NextResponse.json({ error: "Invalid response format from AI" }, { status: 500 })
        }

        return NextResponse.json(tasks)
    } catch (err: any) {
        const errorMessage = err.response?.data || err.message || "Unknown error"
        return NextResponse.json({ error: errorMessage }, { status: err.response?.status || 500 })
    }
}