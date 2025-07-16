import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import mammoth from "mammoth"
import fs from "fs"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

// export const runtime = "edge"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? ".docx" : "";
        if (!ext) {
            return NextResponse.json({ error: "Only DOCX files are supported." }, { status: 400 });
        }
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        fs.writeFileSync(filePath, buffer);

        let resumeText = "";
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            resumeText = result.value;
        } catch (err) {
            fs.unlinkSync(filePath);
            return NextResponse.json({ error: "Failed to parse file: " + (err as Error).message }, { status: 400 });
        }

        fs.unlinkSync(filePath);

        if (!resumeText || resumeText.trim().length < 20) {
            return NextResponse.json({ error: "Failed to extract text from resume." }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY_ANALYZE;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing Groq API key." }, { status: 500 });
        }

        const systemMessage = {
            role: "system",
            content: `You are a resume analysis expert. Analyze the following resume text and return a structured JSON object with exactly these fields:
          
          {
            atsScore: number (Estimate the ATS score from 0–100 based on formatting, keyword usage, structure, grammar, and ATS friendliness.),
            jobTitle: string (Based on the resume's content—including work experience, summary, and skills—identify the most accurate and realistic job title for this candidate, as it would appear in a current job listing. Additionally, determine the candidate’s experience level (e.g., Junior, Mid-Level, Senior, Lead). Use industry-standard language (e.g., 'Senior Software Engineer', 'Mid-Level Data Analyst').),
            location: string (Infer the user's location from the resume, it should be a country, or leave blank if not found.),
            countryCode: string (The ISO 3166-1 alpha-2 country code for the user's location, e.g., 'in' for India, 'us' for United States. If not found, leave blank.),
            topSkills: [
              { name: string, value: number (percentage), color: string }
            ](STRICTLY ONLY TOP FIVE skills in descending order of percentage and can also select keywords if frequently used),
            detailedAnalysis: string[] (5 short bullet points, each explaining one of the below metrics using references from the resume),
            resumeMetrics: [
              { subject: "Relevance", A: number (0–100), fullMark: 100 },
              { subject: "Depth", A: number (0–100), fullMark: 100 },
              { subject: "SoftSkills", A: number (0–100), fullMark: 100 },
              { subject: "Language", A: number (0–100), fullMark: 100 },
              { subject: "Credentials", A: number (0–100), fullMark: 100 }
            ],
            suggestions (nine suggestions for each attribute): {
              skillsToLearn: [{ title: string, description: string }],
              relevantCourses: [{ title: string, description: string }],
              projectIdeas: [{ title: string, description: string }],
              certifications: [{ title: string, description: string }]
            }
          }
          
          Metric Definitions:
          - Relevance: Score based on how well the resume's skills, experiences, and projects align with a typical target role.
          - Depth: Based on the quality and complexity of described projects, not just quantity.
          - SoftSkills: Inferred from resume language that shows leadership, communication, or teamwork.
          - Language: Based on grammar, clarity, spelling, structure, and formatting quality.
          - Credentials: Score based on certifications, achievements, awards, and recognitions.
          
          Instructions:
          - Ensure resumeMetrics includes scores for all five metrics above (used in a spider chart).
          - Evaluate the resume based on each metric. For every metric, provide one clear, specific bullet point in detailedAnalysis. Be balanced — highlight strengths like a professional career mentor, and offer constructive criticism only where improvement is genuinely needed. Criticism must be actionable and specific. Avoid vague feedback.
          - topSkills values must add up to 100% (for pie chart rendering).
          - Based on the resume, generate nine personalized future suggestions for each attribute. Each suggestion must be an object with a 'title' (the suggestion itself) and a 'description' (1-2 sentences explaining why or how it is relevant for the user). Ensure each suggestion aligns with the user's current experience, skills, and interests shown in the resume. Focus on realistic, growth-oriented actions the user can take to improve or expand their profile.
          - Infer and include the most likely jobTitle, location (country name), and countryCode (ISO 2-letter code) for this candidate based on the resume content. If not found, leave as an empty string.
          - Base all results strictly on the resume content provided.
          - Output only the JSON, no extra text or formatting.
          - When generating suggestions, always take into account the candidate’s experience level (e.g., Junior, Mid-Level, Senior, Lead) and ensure that the suggestions are appropriate for that level.`
        }
        const userMessage = {
            role: "user",
            content: resumeText.slice(0, 12000)
        };
        const HF_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
        const url = `https://api.groq.com/openai/v1/chat/completions`;

        let analysis;
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
            });
            const content = response.data.choices?.[0]?.message?.content;
            analysis = typeof content === "string" ? JSON.parse(content) : content;
        } catch (err) {
            return NextResponse.json({ error: "Failed to parse AI response." }, { status: 500 });
        }

        return NextResponse.json(analysis);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
    }
}