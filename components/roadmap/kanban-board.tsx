"use client"

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { RoadmapItem } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import { useTheme } from "next-themes";
import styles from './kanban-board.module.css';
import { useIsMobile } from '@/hooks/use-mobile';
import KanbanBoardMobile from "./kanban-board-mobile";

interface KanbanColumnProps {
    id: string;
    title: string;
    items: RoadmapItem[];
    onTaskClick: (task: RoadmapItem) => void;
    onEditTask: (task: RoadmapItem) => void;
    onDeleteTask: (taskId: string) => void;
    renderTask?: (task: RoadmapItem) => React.ReactNode;
}

interface KanbanBoardProps {
    columns: {
        id: string;
        title: string;
        items: RoadmapItem[];
    }[];
    onTaskClick: (task: RoadmapItem) => void;
    onEditTask: (task: RoadmapItem) => void;
    onDeleteTask: (taskId: string) => void;
    renderTask?: (task: RoadmapItem) => React.ReactNode;
}

// Neon border, light bg, dark text for light mode (same as list view)
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

function KanbanItemStatic({
    item,
    onClick,
    onEdit,
    onDelete
}: {
    item: RoadmapItem;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const { resolvedTheme, theme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;
    const effectiveTheme = theme === 'system' ? systemTheme : resolvedTheme;
    const isLight = effectiveTheme === 'light';
    const colorMap = isLight ? lightDifficultyColors : darkDifficultyColors;
    const cardBg = colorMap[item.difficulty || 'medium'] || colorMap['medium'];
    const titleClass = isLight ? 'text-gray-900' : 'text-white';
    const descClass = isLight ? 'text-gray-800' : 'text-gray-100';
    const badgeClass = isLight
        ? item.difficulty === 'easy' ? 'bg-green-100 text-green-700 border border-green-400 shadow-sm'
            : item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-400 shadow-sm'
                : 'bg-red-100 text-red-700 border border-red-400 shadow-sm'
        : item.difficulty === 'easy' ? 'bg-green-500/30 text-green-50'
            : item.difficulty === 'medium' ? 'bg-yellow-500/30 text-yellow-50'
                : 'bg-red-500/30 text-red-50';
    return (
        <div onClick={onClick}>
            <Card className={`${cardBg} border-2 hover:shadow-xl transition-shadow`}>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className={`font-medium text-lg ${titleClass}`}>{item.title}</h4>
                        <div className="flex space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className={`h-8 w-8 hover:bg-purple-100/10 ${isLight ? 'text-purple-500' : 'text-purple-300'}`}
                            >
                                <Pencil className={`h-4 w-4 ${isLight ? 'text-purple-500' : 'text-purple-300'}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className={`h-8 w-8 hover:bg-red-100/10 ${isLight ? 'text-red-500' : 'text-red-400'}`}
                            >
                                <Trash2 className={`h-4 w-4 ${isLight ? 'text-red-500' : 'text-red-400'}`} />
                            </Button>
                        </div>
                    </div>
                    <p className={`text-sm mb-4 ${descClass}`}>{item.description}</p>
                    <div className="flex justify-between items-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
                            {(item.difficulty || 'medium').charAt(0).toUpperCase() + (item.difficulty || 'medium').slice(1)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function KanbanItemDraggable({
    item,
    onClick,
    onEdit,
    onDelete
}: {
    item: RoadmapItem;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const { resolvedTheme, theme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;
    const effectiveTheme = theme === 'system' ? systemTheme : resolvedTheme;
    const isLight = effectiveTheme === 'light';
    const colorMap = isLight ? lightDifficultyColors : darkDifficultyColors;
    const cardBg = colorMap[item.difficulty || 'medium'] || colorMap['medium'];
    const titleClass = isLight ? 'text-gray-900' : 'text-white';
    const descClass = isLight ? 'text-gray-800' : 'text-gray-100';
    const badgeClass = isLight
        ? item.difficulty === 'easy' ? 'bg-green-100 text-green-700 border border-green-400 shadow-sm'
            : item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-400 shadow-sm'
                : 'bg-red-100 text-red-700 border border-red-400 shadow-sm'
        : item.difficulty === 'easy' ? 'bg-green-500/30 text-green-50'
            : item.difficulty === 'medium' ? 'bg-yellow-500/30 text-yellow-50'
                : 'bg-red-500/30 text-red-50';
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: {
            type: 'task',
            item
        }
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 0,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="cursor-grab active:cursor-grabbing"
        >
            <Card className={`${cardBg} border-2 hover:shadow-xl transition-shadow`}>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className={`font-medium text-lg ${titleClass}`}>{item.title}</h4>
                        <div className="flex space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className={`h-8 w-8 hover:bg-purple-100/10 ${isLight ? 'text-purple-500' : 'text-purple-300'}`}
                            >
                                <Pencil className={`h-4 w-4 ${isLight ? 'text-purple-500' : 'text-purple-300'}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className={`h-8 w-8 hover:bg-red-100/10 ${isLight ? 'text-red-500' : 'text-red-400'}`}
                            >
                                <Trash2 className={`h-4 w-4 ${isLight ? 'text-red-500' : 'text-red-400'}`} />
                            </Button>
                        </div>
                    </div>
                    <p className={`text-sm mb-4 ${descClass}`}>{item.description}</p>
                    <div className="flex justify-between items-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
                            {(item.difficulty || 'medium').charAt(0).toUpperCase() + (item.difficulty || 'medium').slice(1)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function KanbanColumn({ id, title, items, onTaskClick, onEditTask, onDeleteTask, renderTask }: KanbanColumnProps) {
    const { resolvedTheme, theme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => { setMounted(true); }, []);
    const effectiveTheme = theme === 'system' ? systemTheme : resolvedTheme;
    const isLight = effectiveTheme === 'light';
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: {
            type: 'column',
            column: { id, title }
        }
    });
    if (!mounted) return null;
    // Use purple shades for columns in both modes
    const colBg = isLight
        ? 'bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-purple-400'
        : 'bg-purple-950/50 border-purple-800/50';
    const colTitle = isLight ? 'text-purple-900' : 'text-purple-100';
    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-w-[300px] rounded-lg p-4 border transition-colors duration-200 ${colBg} ${isOver ? (isLight ? 'bg-purple-200/60' : 'bg-purple-900/30') : ''}`}
        >
            <h3 className={`font-semibold mb-4 ${colTitle}`}>{title}</h3>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={item.id} className="relative">
                        {renderTask ? (
                            <DraggableTask
                                item={item}
                                onTaskClick={onTaskClick}
                                renderTask={renderTask}
                            />
                        ) : (
                            <KanbanItemStatic
                                item={item}
                                onClick={() => onTaskClick(item)}
                                onEdit={() => onEditTask(item)}
                                onDelete={() => onDeleteTask(item.id)}
                            />
                        )}
                        {index < items.length - 1 && (
                            <div className="absolute bottom-0 left-0 right-0 h-4 -mb-2" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function DraggableTask({ item, onTaskClick, renderTask }: { item: RoadmapItem; onTaskClick: (task: RoadmapItem) => void; renderTask: (task: RoadmapItem) => React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: {
            type: 'task',
            item
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 0,
        cursor: 'grab',
        userSelect: 'none' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onTaskClick(item)}
            className="cursor-grab active:cursor-grabbing"
        >
            {renderTask(item)}
        </div>
    );
}

export function KanbanBoard({ columns, onTaskClick, onEditTask, onDeleteTask, renderTask }: KanbanBoardProps) {
    const isMobile = useIsMobile();
    if (isMobile) {
        return (
            <KanbanBoardMobile
                columns={columns}
                onTaskClick={onTaskClick}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
            />
        );
    }
    return (
        <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map((column) => (
                <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    items={column.items}
                    onTaskClick={onTaskClick}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    renderTask={renderTask}
                />
            ))}
        </div>
    );
}