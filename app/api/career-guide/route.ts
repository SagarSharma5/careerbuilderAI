import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const { messages, userProfile, resumeAnalysis } = await req.json();
    // Fallback: if userProfile is missing, use a generic profile
    const safeUserProfile = userProfile || { type: 'generic', name: 'User' };
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing Groq API key." }, { status: 500 });
    }

    let systemPrompt = "";
    if (safeUserProfile && safeUserProfile.type === 'resume') {
        systemPrompt = `You are a professional resume analyst and career advisor. Greet the user in a friendly, natural way. Help them understand strengths, weaknesses, and opportunities in their resume. Keep the tone human-like, clear, and conversational. Avoid long or overly detailed responses unless asked. Use bullet points or numbered lists only when helpful—don’t overuse them. Stay focused on resume analysis and career guidance. When asked about career direction, connect it to the resume and your expertise. Never mention you're an AI. Keep the interaction realistic, helpful, and concise. Avoid lengthy bullet points unless necessary. \n\nResume Analysis Context: ${resumeAnalysis ? JSON.stringify(resumeAnalysis) : 'No analysis available.'}`;
    } else {
        systemPrompt = "You are a concise, helpful career guide. Greet the user initially. Respond clearly, have a conversation style response and ask follow up questions when appropriate. Never mention you are an AI. Format only when needed: use bullet points for lists, line breaks for clarity, numbered lists when appropriate, and keep responses well-structured and easy to read. Avoid long responses unless absolutely necessary.";
        if (safeUserProfile) {
            systemPrompt += `\n\nUser Profile Information:\n        - Name: ${safeUserProfile.name}\n        - Education Level: ${safeUserProfile.educationLevel}\n        - Interests: ${safeUserProfile.interests?.join(', ')}\n        - Strengths: ${safeUserProfile.strengths?.join(', ')}\n        - Work Preferences: ${safeUserProfile.workPreferences?.join(', ')}\n        - Target Field: ${safeUserProfile.broadField}\n        - Target Role: ${safeUserProfile.specificRole}`;
        }
    }
    if (resumeAnalysis && Object.keys(resumeAnalysis).length > 0) {
        systemPrompt += `\n\nResume Analysis Context: ${JSON.stringify(resumeAnalysis)}`;
    }
    const systemMessage = {
        role: "system",
        content: systemPrompt
    };

    // 1. Only the latest 6 messages are sent in context (excluding system prompt)
    let cleanedMessages = Array.isArray(messages) ? messages.slice(-6) : [];

    // 2. The system prompt appears only once at the beginning
    if (!cleanedMessages.length || cleanedMessages[0].role !== "system") {
        cleanedMessages = [systemMessage, ...cleanedMessages];
    } else {
        cleanedMessages[0] = systemMessage; // Ensure system prompt is always the same
    }

    // 3. Clean messages to avoid prefixes like "User:" or "AI:"
    cleanedMessages = cleanedMessages.map(msg => ({
        ...msg,
        content: msg.content
            .replace(/^User:/i, "")
            .replace(/^AI:/i, "")
            .replace(/^[\s\-:]+/, "")
            .trim()
    }));

    const HF_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    try {
        const response = await axios.post(url, {
            model: HF_MODEL,
            messages: cleanedMessages,
            temperature: 0.7, // Add some creativity while keeping responses focused
            max_tokens: 1000, // Allow for longer, well-formatted responses
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        // Parse and return response cleanly without assistant role artifacts
        let text = response.data.choices?.[0]?.message?.content || "";
        text = text.replace(/^AI:/i, "").replace(/^Assistant:/i, "").trim();
        return NextResponse.json({ text });
    } catch (err: any) {
        const errorMessage = err.response?.data || err.message || "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: err.response?.status || 500 });
    }
}
