"use client"

import type React from "react"
import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useAppState } from "@/components/providers/app-state-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2, Bot } from "lucide-react"
import type { ChatMessage, UserProfile } from "@/types"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Loading from "@/components/loading"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from 'next-themes';

// AI response function using Groq Llama 4 Scout model via API route
async function getAIChatResponse(messages: { role: string; content: string }[], userProfile: any): Promise<string> {
    try {
        const res = await axios.post("/api/career-guide", { messages, userProfile })
        return res.data.text?.trim() || "Sorry, I couldn't get a response from the AI."
    } catch (err: any) {
        if (err.response?.data?.error) {
            return err.response.data.error
        }
        return "Sorry, there was an error contacting the AI."
    }
}

// Add a helper function to format the message text
const formatMessage = (text: string) => {
    // Split the text into lines
    const lines = text.split('\n');

    // Process each line
    return lines.map((line, index) => {
        // Check if the line is a bullet point
        if (line.trim().startsWith('- ')) {
            return (
                <div key={index} className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{line.substring(2)}</span>
                </div>
            );
        }
        // Check if the line is a numbered list item
        else if (/^\d+\.\s/.test(line.trim())) {
            const [number, ...content] = line.split('.');
            return (
                <div key={index} className="flex items-start space-x-2">
                    <span className="text-primary mt-1">{number}.</span>
                    <span>{content.join('.').trim()}</span>
                </div>
            );
        }
        // Regular paragraph
        else if (line.trim()) {
            return <p key={index} className="mb-2">{line}</p>;
        }
        // Empty line for spacing
        else {
            return <div key={index} className="h-2" />;
        }
    });
};

export default function ChatbotPageInner() {
    const { currentUser, updateUser, isRestoringSession, userProfile } = useAppState()
    const router = useRouter()
    const { resolvedTheme } = useTheme();

    // --- Resume Analysis Context from localStorage (one-time handoff) ---
    // Resume Analysis Context from currentUser (managed by AppStateProvider)
    const resumeAnalysis = currentUser?.type === 'resume' ? currentUser.analysis : null;

    const [messages, setMessages] = useState<ChatMessage[]>(currentUser?.chatHistory || [])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [chatStarted, setChatStarted] = useState(() =>
        currentUser?.chatHistory && currentUser.chatHistory.length > 1
    )
    const [showLazyLoading, setShowLazyLoading] = useState(false)

    useEffect(() => {
        if (!isRestoringSession && !currentUser) {
            router.push("/")
        } else if (!isRestoringSession && currentUser?.chatHistory) {
            setMessages(currentUser.chatHistory)
            setChatStarted(currentUser.chatHistory.length > 1)
        } else if (!isRestoringSession && currentUser && !currentUser.chatHistory) {
            const introMessage: ChatMessage = {
                id: `ai-intro-${Date.now()}`,
                sender: "ai",
                text: `Hi ${currentUser.name}! I'm your AI Career Guide. How can I assist you today?`,
                timestamp: Date.now(),
            }
            setMessages([introMessage])
            updateUser(currentUser.id, { ...currentUser, chatHistory: [introMessage] })
            setChatStarted(false)
        }
    }, [currentUser, router, updateUser, isRestoringSession])

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    // Prewarm the model only when the chatbot page is loaded (client-side)
    useEffect(() => {
        const prewarmCareerGuide = async () => {
            try {
                // Send a dummy message to force compilation
                await axios.post("/api/career-guide", {
                    messages: [
                        { role: "system", content: "prewarm only" },
                    ]
                })
                setShowLazyLoading(false) // Show chatbot now
            } catch (err) {
                console.error("Prewarm failed:", err)
                setShowLazyLoading(true)
            }
        }

        setShowLazyLoading(true)
        prewarmCareerGuide()
    }, [])

    const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault()
        if (!input.trim() || !currentUser) return

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: "user",
            text: input,
            timestamp: Date.now(),
        }

        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        updateUser(currentUser.id, { ...currentUser, chatHistory: updatedMessages })
        setInput("")
        setIsTyping(true)
        setChatStarted(true)

        // Build OpenAI-style messages array for context (no system prompt here)
        const openAIMessages = updatedMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
        }))

        // Use userProfile from app state for all logic
        // If resumeAnalysis is present, pass it as before

        // Send resumeAnalysis only if profile is resume and analysis exists
        const body: any = {
            messages: openAIMessages,
            userProfile,
        };
        if (userProfile?.type === 'resume' && resumeAnalysis) {
            body.resumeAnalysis = resumeAnalysis;
        }

        // Call backend API (let backend handle system prompt)
        const aiResponseText = await getAIChatResponseBackend(body)
        const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: aiResponseText,
            timestamp: Date.now(),
        }

        const finalMessages = [...updatedMessages, aiMessage]
        setMessages(finalMessages)
        updateUser(currentUser.id, { ...currentUser, chatHistory: finalMessages })
        setIsTyping(false)

        // Focus input after AI response
        requestAnimationFrame(() => {
            inputRef.current?.focus()
        })
    }

    // Replace getAIChatResponse with backend-only version
    async function getAIChatResponseBackend(body: any): Promise<string> {
        try {
            const response = await axios.post("/api/career-guide", body);
            return response.data.text;
        } catch (err: any) {
            return "Sorry, there was an error getting a response.";
        }
    }

    // Add effect to focus input when chat starts
    useEffect(() => {
        if (chatStarted && inputRef.current) {
            inputRef.current.focus()
        }
    }, [chatStarted])

    if (isRestoringSession) {
        return <Loading message="Restoring session..." />
    }
    if (!currentUser) {
        return <Loading message="Loading profile..." />
    }
    if (showLazyLoading) {
        return <Loading message="Getting your CareerGuide ready!" />
    }

    return (
        <div className="flex flex-col h-[calc(100vh-7rem)] max-w-3xl mx-auto bg-background relative select-text">
            {/* Minimal input bar before chat starts, centered on page with welcome text */}
            {!chatStarted ? (
                <div className="flex flex-1 items-center justify-center flex-col">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">Welcome to your Career Guide Chatbot</h2>
                        <p className="text-muted-foreground text-base">
                            Ask me anything about your career, resume, or roadmap to get started.
                        </p>
                    </div>
                    <form
                        onSubmit={handleSendMessage}
                        className="w-full max-w-xl mx-auto p-4 bg-background border rounded-xl shadow-lg flex items-center gap-2"
                    >
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Send a message to start the chat..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-grow"
                            disabled={isTyping}
                            autoFocus
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="flex flex-col h-full rounded-xl border shadow-lg">
                    <header className="p-4 border-b bg-background/80 backdrop-blur sticky top-0 z-30 rounded-t-xl">
                        <h1 className="text-xl font-semibold">Career Guide Chatbot</h1>
                        <p className="text-sm text-muted-foreground">Chatting as: {currentUser.name}</p>
                    </header>
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <ScrollArea className="flex-1 pb-20">
                            <div className="p-4">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={cn(
                                                "flex items-end space-x-2 mb-4",
                                                msg.sender === "user" ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            {msg.sender === "ai" && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>
                                                        <Bot size={18} />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={cn(
                                                    "max-w-[70%] p-3 rounded-2xl shadow transition-colors border",
                                                    msg.sender === "user"
                                                        ? (resolvedTheme === 'dark'
                                                            ? 'bg-indigo-600 text-white border-indigo-400 rounded-br-none'
                                                            : 'bg-indigo-500 text-white border-indigo-200 rounded-br-none')
                                                        : (resolvedTheme === 'dark'
                                                            ? 'bg-slate-800 text-slate-100 border-slate-700 rounded-bl-none'
                                                            : 'bg-white text-gray-900 border-gray-200 rounded-bl-none')
                                                )}
                                            >
                                                <div className="text-sm whitespace-pre-wrap">
                                                    {msg.sender === "ai" ? formatMessage(msg.text) : msg.text}
                                                </div>
                                                <p className="text-xs opacity-70 mt-1 text-right">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                            {msg.sender === "user" && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={`https://avatar.vercel.sh/${currentUser?.id}.png`}
                                                        alt={currentUser?.name}
                                                    />
                                                    <AvatarFallback>{currentUser.name.substring(0, 1)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                        </motion.div>
                                    ))}
                                    {/* Skeleton loader for initial AI response */}
                                    {isTyping && messages.length === 1 && messages[0].sender === "ai" && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-end space-x-2 mb-4 justify-start"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    <Bot size={18} />
                                                </AvatarFallback>
                                            </Avatar>
                                            <Skeleton className="h-10 w-32 md:w-48" />
                                        </motion.div>
                                    )}
                                    {isTyping && messages.length > 1 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-end space-x-2 mb-4 justify-start"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    <Bot size={18} />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="max-w-[70%] p-3 rounded-2xl shadow bg-muted rounded-bl-none">
                                                <div className="flex space-x-2">
                                                    <motion.div
                                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Number.POSITIVE_INFINITY,
                                                            ease: "easeInOut",
                                                        }}
                                                        className="w-2 h-2 bg-foreground/50 rounded-full"
                                                    />
                                                    <motion.div
                                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Number.POSITIVE_INFINITY,
                                                            ease: "easeInOut",
                                                            delay: 0.2,
                                                        }}
                                                        className="w-2 h-2 bg-foreground/50 rounded-full"
                                                    />
                                                    <motion.div
                                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Number.POSITIVE_INFINITY,
                                                            ease: "easeInOut",
                                                            delay: 0.4,
                                                        }}
                                                        className="w-2 h-2 bg-foreground/50 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={chatEndRef} />
                            </div>
                        </ScrollArea>
                        <form
                            onSubmit={handleSendMessage}
                            className="absolute bottom-0 left-0 right-0 w-full p-4 bg-background border-t z-50 flex items-center gap-2 shadow-lg rounded-b-xl"
                        >
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-grow"
                                disabled={isTyping}
                                autoFocus
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
