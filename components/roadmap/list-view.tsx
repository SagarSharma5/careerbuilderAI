"use client"

import React, { useEffect, useState } from "react"
import { RoadmapItem } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, CheckCircle2, Circle, Clock } from "lucide-react"
import { useTheme } from "next-themes"

interface ListViewProps {
    items: RoadmapItem[]
    onTaskClick: (task: RoadmapItem) => void
    onEditTask: (task: RoadmapItem) => void
    onDeleteTask: (taskId: string) => void
}

const difficultyColors: Record<string, string> = {
    easy: 'bg-green-900/50 border-green-500',
    medium: 'bg-yellow-900/50 border-yellow-500',
    hard: 'bg-red-900/50 border-red-500'
}

// Neon border, light bg, dark text for light mode
const lightDifficultyColors: Record<string, string> = {
    easy: 'bg-green-50 border-green-400',
    medium: 'bg-yellow-50 border-yellow-400',
    hard: 'bg-red-50 border-red-400'
}

const statusConfig = {
    not_started: {
        title: "To Do",
        icon: Circle,
        color: "text-purple-300"
    },
    in_progress: {
        title: "In Progress",
        icon: Clock,
        color: "text-yellow-400"
    },
    done: {
        title: "Done",
        icon: CheckCircle2,
        color: "text-green-400"
    }
}

export function ListView({ items, onTaskClick, onEditTask, onDeleteTask }: ListViewProps) {
    const { resolvedTheme, theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;
    const effectiveTheme = theme === 'system' ? systemTheme : resolvedTheme;
    const isLight = effectiveTheme === 'light';
    const colorMap = isLight ? lightDifficultyColors : difficultyColors;

    // Group items by status
    const groupedItems = items.reduce((acc, item) => {
        const status = item.status || 'not_started';
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(item);
        return acc;
    }, {} as Record<string, RoadmapItem[]>);

    return (
        <div className="h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            <div className="space-y-8">
                {Object.entries(statusConfig).map(([status, config]) => {
                    const items = groupedItems[status] || [];
                    const Icon = config.icon;

                    return (
                        <div key={status} className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-purple-800/50 pb-2">
                                <Icon className={`h-5 w-5 ${config.color}`} />
                                <h3 className={`text-lg font-semibold ${config.color}`}>
                                    {config.title} ({items.length})
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <Card
                                        key={item.id}
                                        className={`${colorMap[item.difficulty || 'medium']} border-2 hover:shadow-lg transition-shadow`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div
                                                    className="space-y-2 flex-1 cursor-pointer"
                                                    onClick={() => onTaskClick(item)}
                                                >
                                                    <h4 className={`font-medium text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.title}</h4>
                                                    <p className={`text-sm ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>{item.description}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium
                                                            ${isLight
                                                                ? item.difficulty === 'easy' ? 'bg-green-100 text-green-700 border border-green-400 shadow-sm'
                                                                    : item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-400 shadow-sm'
                                                                        : 'bg-red-100 text-red-700 border border-red-400 shadow-sm'
                                                                : item.difficulty === 'easy' ? 'bg-green-500/30 text-green-50'
                                                                    : item.difficulty === 'medium' ? 'bg-yellow-500/30 text-yellow-50'
                                                                        : 'bg-red-500/30 text-red-50'}`}
                                                        >
                                                            {(item.difficulty || 'medium').charAt(0).toUpperCase() + (item.difficulty || 'medium').slice(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 ml-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEditTask(item);
                                                        }}
                                                        className={`h-8 w-8 hover:bg-purple-100/10 z-10 ${isLight ? 'text-purple-500' : 'text-purple-300'}`}
                                                    >
                                                        <Pencil className={`h-4 w-4 ${isLight ? 'text-purple-500' : 'text-purple-300'}`} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteTask(item.id);
                                                        }}
                                                        className={`h-8 w-8 hover:bg-red-100/10 z-10 ${isLight ? 'text-red-500' : 'text-red-400'}`}
                                                    >
                                                        <Trash2 className={`h-4 w-4 ${isLight ? 'text-red-500' : 'text-red-400'}`} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {items.length === 0 && (
                                    <div className="text-center py-8 text-purple-300/50">
                                        No tasks in this category
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}