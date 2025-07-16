import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function POST(req: NextRequest) {
    const { interests, strengths, educationLevel, workPreferences, selectedField } = await req.json()
    const apiKey = process.env.GROQ_API_KEY_TASKS

    if (!apiKey) {
        return NextResponse.json({ error: "Missing Groq API key." }, { status: 500 })
    }

    const systemMessage = {
        role: "system",
        content: selectedField
            ? `You are a career advisor. Based on the user's education level, interests, strengths, work preferences, and selected career field, suggest specific job roles.
            Return a JSON object with an array of roles that are relevant to the selected field.
            Each role should be a string. Keep suggestions relevant and modern.`
            : `You are a career advisor. Based on the user's education level, interests, strengths and work preferences, suggest relevant career fields and specific roles.
            Return a JSON object with two arrays:
            - fields: array of broad career fields
            - roles: array of specific job roles
            
            Each field and role should be a string. Keep suggestions relevant and modern.`
    }

    const userMessage = {
        role: "user",
        content: selectedField
            ? `Suggest specific job roles in ${selectedField} for someone with:
            - Education: ${educationLevel}
            - Interests: ${interests.join(', ')}
            - Strengths: ${strengths.join(', ')}
            - Work Preferences: ${workPreferences.join(', ')}

            Return a JSON object with a roles array.`
            : `Suggest career fields and roles for someone with:
            - Education: ${educationLevel}
            - Interests: ${interests.join(', ')}
            - Strengths: ${strengths.join(', ')}
            - Work Preferences: ${workPreferences.join(', ')}

            Return a JSON object with fields and roles arrays.`
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

        const suggestions = JSON.parse(response.data.choices?.[0]?.message?.content || '{"fields":[],"roles":[]}')

        // If we're only getting roles, ensure we return the correct format
        if (selectedField) {
            return NextResponse.json({ roles: suggestions.roles || [] })
        }

        return NextResponse.json(suggestions)
    } catch (err: any) {
        const errorMessage = err.response?.data || err.message || "Unknown error"
        return NextResponse.json({ error: errorMessage }, { status: err.response?.status || 500 })
    }
} 