"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { RoadmapItem } from "@/types";
import { useTheme } from "next-themes";
import styles from './kanban-board.module.css';

interface KanbanBoardMobileProps {
    columns: {
        id: string;
        title: string;
        items: RoadmapItem[];
    }[];
    onTaskClick: (task: RoadmapItem) => void;
    onEditTask: (task: RoadmapItem) => void;
    onDeleteTask: (taskId: string) => void;
}

const lightDifficultyColors: Record<string, string> = {
    easy: 'bg-green-50 border-green-400',
    medium: 'bg-yellow-50 border-yellow-400',
    hard: 'bg-red-50 border-red-400'
};

const darkDifficultyColors: Record<string, string> = {
    easy: 'bg-green-900/50 border-green-500',
    medium: 'bg-yellow-900/50 border-yellow-500',
    hard: 'bg-red-900/50 border-red-500'
};

function KanbanColumnDisplay({
    id,
    title,
    items,
    onTaskClick,
    onEditTask,
    onDeleteTask
}: {
    id: string;
    title: string;
    items: RoadmapItem[];
    onTaskClick: (task: RoadmapItem) => void;
    onEditTask: (task: RoadmapItem) => void;
    onDeleteTask: (taskId: string) => void;
}) {
    const { resolvedTheme, theme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(null);

    React.useEffect(() => { setMounted(true); }, []);

    const effectiveTheme = theme === 'system' ? systemTheme : resolvedTheme;
    const isLight = effectiveTheme === 'light';
    const colBg = isLight
        ? 'bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-purple-400'
        : 'bg-purple-950/50 border-purple-800/50';
    const colTitle = isLight ? 'text-purple-900' : 'text-purple-100';
    const colorMap = isLight ? lightDifficultyColors : darkDifficultyColors;

    if (!mounted) return null;

    const handleTaskClick = (item: RoadmapItem) => {
        setExpandedTaskId(expandedTaskId === item.id ? null : item.id);
    };

    return (
        <div
            className={`rounded-xl border-2 transition-all duration-300 ${colBg} flex flex-col justify-start`}
            style={{
                width: '90vw',
                maxWidth: '400px',
                margin: '0 auto',
                padding: '0.75rem',
                height: 'auto', // Remove fixed height
                minHeight: '0',
            }}
        >
            <h3 className={`font-bold mb-3 text-lg ${colTitle} text-center flex-shrink-0`}>
                {title}
            </h3>
            <div
                className="flex flex-col gap-2"
                style={{ maxHeight: undefined, flex: 'unset', overflow: 'visible' }}
            >
                {items.map((item) => {
                    const cardBg = colorMap[item.difficulty || 'medium'] || colorMap['medium'];
                    const titleClass = isLight ? 'text-gray-900' : 'text-white';
                    const descClass = isLight ? 'text-gray-700' : 'text-gray-200';
                    const badgeClass = isLight
                        ? item.difficulty === 'easy' ? 'bg-green-100 text-green-800 border border-green-300'
                            : item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                        : item.difficulty === 'easy' ? 'bg-green-500/30 text-green-100'
                            : item.difficulty === 'medium' ? 'bg-yellow-500/30 text-yellow-100'
                                : 'bg-red-500/30 text-red-100';

                    const expanded = expandedTaskId === item.id;

                    return (
                        <Card
                            key={item.id}
                            className={`w-full ${cardBg} border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer flex-shrink-0`}
                        >
                            <CardContent
                                className="p-2"
                                onClick={() => handleTaskClick(item)}
                            >
                                {!expanded ? (
                                    // Collapsed view - compact
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium text-xs leading-tight truncate ${titleClass}`}>
                                                {item.title}
                                            </h4>
                                        </div>
                                        <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${badgeClass}`}>
                                            {(item.difficulty || 'medium').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                ) : (
                                    // Expanded view - with description and actions
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`font-semibold text-sm leading-tight flex-1 pr-2 ${titleClass}`}>
                                                {item.title}
                                            </h4>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${badgeClass}`}>
                                                {(item.difficulty || 'medium').charAt(0).toUpperCase() + (item.difficulty || 'medium').slice(1)}
                                            </span>
                                        </div>

                                        <p className={`text-xs leading-relaxed ${descClass}`}>
                                            {item.description}
                                        </p>

                                        <div className="flex justify-between items-center pt-1">
                                            <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                                Tap to collapse
                                            </div>
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditTask(item);
                                                    }}
                                                    className={`h-7 w-7 rounded-full hover:bg-purple-100/20 ${isLight ? 'text-purple-600' : 'text-purple-300'
                                                        }`}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteTask(item.id);
                                                    }}
                                                    className={`h-7 w-7 rounded-full hover:bg-red-100/20 ${isLight ? 'text-red-600' : 'text-red-400'
                                                        }`}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {items.length === 0 && (
                    <div className="flex items-center justify-center flex-1 min-h-[200px]">
                        <div className="text-center">
                            <div className={`text-base font-medium ${isLight ? 'text-purple-400' : 'text-purple-300'} mb-2`}>
                                No tasks yet
                            </div>
                            <div className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                Add your first task to get started
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function KanbanBoardMobile({
    columns,
    onTaskClick,
    onEditTask,
    onDeleteTask
}: KanbanBoardMobileProps) {
    const [currentCol, setCurrentCol] = React.useState(0);
    const carouselRef = React.useRef<HTMLDivElement>(null);

    // Snap to column on change
    React.useEffect(() => {
        if (carouselRef.current) {
            const containerWidth = carouselRef.current.clientWidth;
            const scrollLeft = currentCol * containerWidth;
            // Remove scrollBehavior for instant jump, let user drag naturally
            carouselRef.current.scrollTo({
                left: scrollLeft,
                behavior: 'auto',
            });
        }
    }, [currentCol]);

    // Handle column swiping with real-time follow
    React.useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;

        let startX = 0;
        let scrollStart = 0;
        let dragging = false;

        function onTouchStart(e: TouchEvent) {
            if (!el) return;
            dragging = true;
            startX = e.touches[0].clientX;
            scrollStart = el.scrollLeft;
            el.style.scrollBehavior = 'auto';
        }

        function onTouchMove(e: TouchEvent) {
            if (!dragging || !el) return;
            // Remove preventDefault for native smoothness
            const dx = startX - e.touches[0].clientX;
            el.scrollLeft = scrollStart + dx;
        }

        function onTouchEnd() {
            if (!dragging || !el) return;
            dragging = false;
            el.style.scrollBehavior = 'smooth';
            const containerWidth = el.clientWidth;
            const col = Math.round(el.scrollLeft / containerWidth);
            setCurrentCol(Math.max(0, Math.min(columns.length - 1, col)));
        }

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: true });
        el.addEventListener('touchend', onTouchEnd);

        return () => {
            if (!el) return;
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [columns.length]);

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Column indicators - at the very top */}
            <div className="flex justify-center space-x-2 py-4 flex-shrink-0 order-0">
                {columns.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentCol(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${currentCol === index
                            ? 'bg-purple-500 scale-125'
                            : 'bg-purple-300 hover:bg-purple-400'
                            }`}
                    />
                ))}
            </div>
            {/* Carousel container */}
            <div className="flex-1 overflow-hidden order-2">
                <div
                    ref={carouselRef}
                    className="flex h-full overflow-hidden"
                    style={{
                        width: '100%',
                        scrollSnapType: 'x mandatory',
                        touchAction: 'pan-x'
                    }}
                >
                    {columns.map((column, idx) => (
                        <div
                            key={column.id}
                            className="flex-shrink-0 w-full h-full flex items-start justify-center overflow-hidden"
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            {idx === currentCol && (
                                <KanbanColumnDisplay
                                    id={column.id}
                                    title={column.title}
                                    items={column.items}
                                    onTaskClick={onTaskClick}
                                    onEditTask={onEditTask}
                                    onDeleteTask={onDeleteTask}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}