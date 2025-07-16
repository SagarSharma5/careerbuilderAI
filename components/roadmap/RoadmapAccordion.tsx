import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { RoadmapItem, Subtask } from '@/types/roadmap'; // Import types
import LoadingModal from '@/components/loading-modal';
import { useAppState } from '@/components/providers/app-state-provider';
import Confetti from 'react-confetti';
import { useRef } from 'react';
import { useTheme } from 'next-themes';

const LEVELS = [
    { min: 0, max: 1, title: 'Newcomer', color: 'bg-blue-200 text-blue-800' },
    { min: 2, max: 3, title: 'Beginner Explorer', color: 'bg-indigo-200 text-indigo-800' },
    { min: 4, max: 5, title: 'Motivated Starter', color: 'bg-green-200 text-green-800' },
    { min: 6, max: 7, title: 'Skill Builder', color: 'bg-yellow-200 text-yellow-800' },
    { min: 8, max: 9, title: 'Aspiring Achiever', color: 'bg-orange-200 text-orange-800' },
    { min: 10, max: 11, title: 'Career Trailblazer', color: 'bg-purple-200 text-purple-800' },
    { min: 12, max: 13, title: 'Growth Champion', color: 'bg-pink-200 text-pink-800' },
    { min: 14, max: 15, title: 'Master Navigator', color: 'bg-teal-200 text-teal-800' },
    { min: 16, max: 17, title: 'Visionary', color: 'bg-red-200 text-red-800' },
    { min: 18, max: 1000, title: 'Legend', color: 'bg-gray-200 text-gray-800' },
];

function getLevelTitle(completed: number): { title: string; color: string } {
    for (const level of LEVELS) {
        if (completed >= level.min && completed <= level.max) return { title: level.title, color: level.color };
    }
    return { title: 'Legend', color: 'bg-gray-200 text-gray-800' };
}

interface RoadmapAccordionProps {
    fitScreen?: boolean;
}

export type { RoadmapAccordionProps };

export default function RoadmapAccordion({ fitScreen }: RoadmapAccordionProps) {
    const { currentUser } = useAppState();
    const [tasks, setTasks] = useState<RoadmapItem[]>([]);
    const [openTask, setOpenTask] = useState<string | null>(null);
    const [showCongrats, setShowCongrats] = useState(false);
    const [congratsTask, setCongratsTask] = useState<string | null>(null);
    const [showAllDone, setShowAllDone] = useState(false);
    const [archivedProgress, setArchivedProgress] = useState({ completed: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentCompleted = useMemo(() => tasks.reduce((acc, t) => acc + t.subtasks.filter((st) => st.done).length, 0), [tasks]);
    const currentTotal = useMemo(() => tasks.reduce((acc, t) => acc + t.subtasks.length, 0), [tasks]);

    const totalCompletedCount = archivedProgress.completed + currentCompleted;
    const totalTasksCount = archivedProgress.total + currentTotal;

    const progress = totalTasksCount === 0 ? 0 : Math.round((totalCompletedCount / totalTasksCount) * 100);
    const allCurrentTasksDone = useMemo(() => tasks.length > 0 && tasks.every((task) => task.subtasks.every((st) => st.done)), [tasks]);
    const level = getLevelTitle(totalCompletedCount);

    // Confetti for level up
    const [showLevelConfetti, setShowLevelConfetti] = useState(false);
    const levelRef = React.useRef(level.title);
    const levelContainerRef = React.useRef<HTMLDivElement>(null);

    // Detect level change and trigger confetti
    useEffect(() => {
        if (levelRef.current !== level.title) {
            setShowLevelConfetti(true);
            levelRef.current = level.title;
            const timeout = setTimeout(() => setShowLevelConfetti(false), 2000); // 2 seconds total
            return () => clearTimeout(timeout);
        }
    }, [level.title]);

    // State for full-page confetti when all tasks are done
    const [showFullConfetti, setShowFullConfetti] = useState(false);

    // Show full-page confetti for 5 seconds when all tasks are done (only if triggered by completion, not by new tasks)
    useEffect(() => {
        // Only show confetti if allCurrentTasksDone just became true (not when tasks are regenerated)
        if (showAllDone && tasks.length > 0 && tasks.every((task) => task.subtasks.every((st) => st.done))) {
            setShowFullConfetti(true);
            const timeout = setTimeout(() => setShowFullConfetti(false), 5000);
            return () => clearTimeout(timeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showAllDone]);

    // When new tasks are generated, always hide the full confetti
    useEffect(() => {
        setShowFullConfetti(false);
    }, [tasks]);

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!currentUser || currentUser.type !== 'startFresh') throw new Error('No start-fresh user profile found.');
            // Use actual user profile data for the API call
            const userProfile = {
                educationLevel: currentUser.educationLevel,
                interests: currentUser.interests,
                strengths: currentUser.strengths,
                workPreferences: currentUser.workPreferences,
                broadField: currentUser.broadField,
                specificRole: currentUser.specificRole,
                note: "Please generate a new set of tasks and subtasks that are different from the previous ones."
            };
            // Add a unique query param to force new data
            const url = `/api/generateTasks?t=${Date.now()}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userProfile),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: RoadmapItem[] = await response.json();
            // Limit each task's subtasks to 5
            const limitedData = data.map(task => ({
                ...task,
                subtasks: Array.isArray(task.subtasks) ? task.subtasks.slice(0, 5) : []
            }));
            setTasks(limitedData);
        } catch (e: any) {
            setError(e.message);
            console.error("Failed to fetch tasks:", e);
        } finally {
            setLoading(false);
        }
    };

    // Helper to create a hash of the current profile for cache validation
    function getProfileHash(profile: any) {
        return JSON.stringify({
            educationLevel: profile.educationLevel,
            interests: profile.interests,
            strengths: profile.strengths,
            workPreferences: profile.workPreferences,
            broadField: profile.broadField,
            specificRole: profile.specificRole
        });
    }

    // Store the last used profile hash in a ref
    const lastProfileHash = useRef<string | null>(null);

    // On mount, load from sessionStorage if available and profile matches
    useEffect(() => {
        if (!currentUser || currentUser.type !== 'startFresh') return;
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem('roadmap-tasks') : null;
        const cachedProfile = typeof window !== 'undefined' ? sessionStorage.getItem('roadmap-tasks-profile') : null;
        const currentProfileHash = getProfileHash(currentUser);
        lastProfileHash.current = currentProfileHash;
        if (cached && cachedProfile === currentProfileHash) {
            setTasks(JSON.parse(cached));
            setLoading(false);
        } else {
            fetchTasks();
        }
    }, []);

    // When tasks change, cache them with the current profile hash
    useEffect(() => {
        if (tasks.length > 0 && typeof window !== 'undefined' && currentUser && currentUser.type === 'startFresh') {
            sessionStorage.setItem('roadmap-tasks', JSON.stringify(tasks));
            sessionStorage.setItem('roadmap-tasks-profile', getProfileHash(currentUser));
        }
    }, [tasks, currentUser]);

    // When the user updates their profile and submits, clear cache and fetch new tasks only if the profile hash changes
    const startFreshProfile = currentUser && currentUser.type === 'startFresh' ? currentUser : null;
    useEffect(() => {
        if (!startFreshProfile) return;
        const currentProfileHash = getProfileHash(startFreshProfile);
        if (lastProfileHash.current !== null && lastProfileHash.current !== currentProfileHash) {
            sessionStorage.removeItem('roadmap-tasks');
            sessionStorage.removeItem('roadmap-tasks-profile');
            fetchTasks();
            lastProfileHash.current = currentProfileHash;
        }
    }, [
        startFreshProfile?.educationLevel,
        startFreshProfile?.interests,
        startFreshProfile?.strengths,
        startFreshProfile?.workPreferences,
        startFreshProfile?.broadField,
        startFreshProfile?.specificRole
    ]);

    useEffect(() => {
        if (allCurrentTasksDone) {
            setShowAllDone(true);
        }
    }, [allCurrentTasksDone]);

    const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
        let taskTitleForCongrats: string | null = null;
        let shouldShowCongrats = false;
        setTasks((prevTasks) => {
            const newTasks = prevTasks.map((task) => {
                if (task.id !== taskId) return task;

                const wasTaskIncomplete = !task.subtasks.every((st) => st.done);
                const newSubtasks = task.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, done: !st.done } : st
                );
                const isTaskNowComplete = newSubtasks.every((st) => st.done);

                if (isTaskNowComplete && wasTaskIncomplete) {
                    taskTitleForCongrats = task.title;
                    const areAllOtherTasksDone = prevTasks.every(
                        (t) => t.id === taskId || t.subtasks.every((st) => st.done)
                    );
                    if (!areAllOtherTasksDone) {
                        shouldShowCongrats = true;
                    }
                }
                return { ...task, subtasks: newSubtasks };
            });
            return newTasks;
        });

        if (shouldShowCongrats && taskTitleForCongrats) {
            setCongratsTask(taskTitleForCongrats);
            setShowCongrats(true);
        }
    };

    const handleCloseCongrats = () => {
        setShowCongrats(false);
        setCongratsTask(null);
    };

    const handleCloseAllDone = () => {
        setShowAllDone(false);
    };

    // When user clicks Generate More Tasks, clear cache and fetch new tasks
    const handleGenerateNextTasks = () => {
        setArchivedProgress((prev) => ({
            completed: prev.completed + currentCompleted,
            total: prev.total + currentTotal
        }));
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('roadmap-tasks');
            sessionStorage.removeItem('roadmap-tasks-profile');
        }
        fetchTasks(); // Fetch new tasks
        setOpenTask(null);
        setShowAllDone(false);
        setShowCongrats(false); // Ensure single task congrats is also reset
        setCongratsTask(null);
    };

    const anyOpen = !!openTask;
    const { resolvedTheme } = useTheme();

    if (loading) {
        return <LoadingModal isLoading={true} message="Generating your personalized roadmap..." />;
    }

    if (error) {
        return <div className="flex justify-center items-center h-full text-lg text-red-500">Error: {error}</div>;
    }

    if (tasks.length === 0 && !loading) {
        return <div className="flex justify-center items-center h-full text-lg">No tasks generated. Try again.</div>;
    }

    return (
        <div className={`w-full ${fitScreen ? 'h-full' : 'min-h-screen'} flex flex-col flex-1`}
            style={{
                // Enable vertical scroll for mobile only
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                maxHeight: '100vh',
            }}
        >
            {/* Full-page confetti when all tasks are done */}
            <AnimatePresence>
                {showFullConfetti && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 10000,
                            pointerEvents: 'none',
                        }}
                    >
                        <Confetti
                            width={typeof window !== 'undefined' ? window.innerWidth : 1920}
                            height={typeof window !== 'undefined' ? window.innerHeight : 1080}
                            numberOfPieces={350}
                            recycle={false}
                            gravity={0.35}
                            tweenDuration={400}
                            initialVelocityX={18}
                            initialVelocityY={18}
                            confettiSource={{
                                x: (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2 - 20,
                                y: (typeof window !== 'undefined' ? window.innerHeight : 1080) / 2 - 20,
                                w: 40,
                                h: 40,
                            }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                width: '100vw',
                                height: '100vh',
                                pointerEvents: 'none',
                                zIndex: 10000,
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <div
                className={
                    `grid grid-cols-1 md:grid-cols-2 gap-8 ${fitScreen ? 'h-full' : 'flex-1'} `
                }
                style={fitScreen ? { height: '100%' } : { minHeight: 0, height: '100%' }}
            >
                {/* LEFT SIDE (now Tasks) */}
                <div className="flex flex-col h-[68vh] md:h-full rounded-2xl shadow-xl bg-white/90 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 p-4 md:p-6 overflow-hidden sm:overflow-y-auto sm:max-h-[80vh] flex-1">
                    <h2 className={cn("text-xl md:text-xl font-bold mb-4",
                        'text-[#5330cf]',
                        'dark:text-[#c4b5fd]',
                        'text-lg sm:text-xl' // smaller on mobile
                    )}>Tasks</h2>
                    <div className="w-full flex-1 flex flex-col gap-3 overflow-hidden sm:overflow-y-auto">
                        {tasks.map((task) => {
                            const allDone = task.subtasks.every((st) => st.done);
                            const isOpen = openTask === task.id;
                            // Choose background shade based on open/closed and theme
                            let cardBg = '';
                            if (isOpen) {
                                cardBg = resolvedTheme === 'dark'
                                    ? 'bg-[#23204a]/80'
                                    : 'bg-[#ede9fe]/80';
                            } else {
                                cardBg = resolvedTheme === 'dark'
                                    ? 'bg-[#312e81]/70'
                                    : 'bg-[#e0e7ff]/80';
                            }
                            return (
                                <motion.div
                                    key={task.id}
                                    layout
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    className={cn(
                                        'rounded-2xl border shadow-sm cursor-pointer w-full transition-colors duration-200',
                                        cardBg,
                                        allDone ? 'border-green-400' : 'border-gray-200 dark:border-slate-700',
                                    )}
                                    style={
                                        anyOpen
                                            ? {
                                                flexBasis: '4rem',
                                                flexShrink: 0,
                                                flexGrow: isOpen ? 1 : 0,
                                                overflow: 'hidden',
                                            }
                                            : {
                                                flexGrow: 1,
                                                flexBasis: 0,
                                                minHeight: 0,
                                                overflow: 'hidden',
                                            }
                                    }
                                    onClick={() => setOpenTask(isOpen ? null : task.id)}
                                >
                                    <div
                                        className={cn(
                                            'flex items-center px-3 md:px-6 font-semibold select-none relative',
                                            isOpen ? 'justify-between h-14 md:h-16' : 'justify-center text-center h-full',
                                            'text-black dark:text-white',
                                            'text-base sm:text-xl' // smaller on mobile
                                        )}
                                    >
                                        <motion.span
                                            layout="position"
                                            className={cn(
                                                "flex-grow min-w-0 break-words whitespace-normal",
                                                'text-base sm:text-xl' // smaller on mobile
                                            )}
                                            animate={{ fontSize: isOpen ? '1.1rem' : '1.3rem' }}
                                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                        >
                                            {task.title}
                                        </motion.span>
                                        {allDone && !isOpen && (
                                            <motion.div layoutId={`check-${task.id}`} className="absolute right-3 md:right-6">
                                                <svg className="w-6 h-6 md:w-7 md:h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            </motion.div>
                                        )}
                                    </div>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                key="content"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto', transition: { delay: 0.1, duration: 0.2 } }}
                                                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                                                className="px-3 md:px-6 pb-4 md:pb-6 overflow-y-auto"
                                                style={{ height: 'calc(100% - 3.5rem)' }} // Fill remaining space
                                            >
                                                <div className='flex justify-between items-center mb-3 md:mb-4'>
                                                    <p className='text-xs sm:text-sm text-gray-500'>{task.subtasks.filter(st => st.done).length} of {task.subtasks.length} completed</p>
                                                    {allDone && (
                                                        <motion.div layoutId={`check-${task.id}`}>
                                                            <svg className="w-6 h-6 md:w-7 md:h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                <ul className="space-y-3 md:space-y-4">
                                                    {task.subtasks.map((st) => (
                                                        <li key={st.id} className="flex items-center space-x-3 md:space-x-4">
                                                            <Checkbox
                                                                id={`${task.id}-${st.id}`}
                                                                checked={st.done}
                                                                onCheckedChange={() => handleSubtaskToggle(task.id, st.id)}
                                                                onClick={e => e.stopPropagation()}
                                                                className="border-[#7c3aed] data-[state=checked]:bg-[#7c3aed] data-[state=checked]:border-[#7c3aed] w-5 h-5 md:w-6 md:h-6"
                                                            />
                                                            <label htmlFor={`${task.id}-${st.id}`} className={cn('text-base sm:text-lg cursor-pointer', st.done && 'line-through text-gray-400')} onClick={e => e.stopPropagation()}>{st.label}</label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT SIDE (now Progress/Level) */}
                <div className="flex flex-col h-[60vh] md:h-full gap-4 sm:overflow-y-auto sm:max-h-[100vh] flex-shrink-0">
                    {/* Progress Meter Section */}
                    <div className="flex-1 min-h-[270px] sm:min-h-[320px] flex flex-col rounded-2xl shadow-xl bg-white/90 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 p-5 md:p-8 mb-3 overflow-hidden">
                        <h2 className={cn("text-xl font-bold mb-4",
                            'text-[#5330cf]',
                            'dark:text-[#c4b5fd]')}>Progress Meter</h2>
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 w-full h-full">
                            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-36 md:h-36 lg:w-40 lg:h-40 mb-3 flex-shrink-0">
                                <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 200 200">
                                    <defs>
                                        <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#a78bfa" />
                                            <stop offset="50%" stopColor="#7c3aed" />
                                            <stop offset="100%" stopColor="#22d3ee" />
                                        </linearGradient>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <circle cx="100" cy="100" r="88" stroke="#e5e7eb" strokeWidth="20" fill="none" />
                                    <motion.circle
                                        cx="100" cy="100" r="88"
                                        stroke="url(#progress-gradient)"
                                        strokeWidth="20"
                                        fill="none"
                                        strokeDasharray={2 * Math.PI * 88}
                                        strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                                        initial={false}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progress / 100) }}
                                        transition={{ duration: 0.7, type: 'spring' }}
                                        strokeLinecap="round"
                                        style={{ filter: 'url(#glow)' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                    <span className="text-2xl sm:text-4xl font-extrabold text-[#7c3aed] drop-shadow-sm leading-none">{progress}<span className="text-base sm:text-lg font-bold align-top">%</span></span>
                                    <span className="text-xs sm:text-base font-medium text-gray-500 mt-1">Progress</span>
                                </div>
                            </div>
                            <div className="w-full flex flex-col items-center justify-center">
                                <span className="text-gray-500 text-xs sm:text-sm md:text-base text-center whitespace-nowrap">{totalCompletedCount} of {totalTasksCount} subtasks completed</span>
                            </div>
                        </div>
                    </div>
                    {/* Level Indicator Section */}
                    <div className="flex-1 min-h-[170px] sm:min-h-[220px] flex flex-col rounded-2xl shadow-xl bg-white/90 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 p-5 md:p-8 mt-3" ref={levelContainerRef} style={{ position: 'relative', overflow: 'visible' }}>
                        <h2 className={cn("text-2xl font-bold mb-6",
                            'text-[#5330cf]',
                            'dark:text-[#c4b5fd]')}>Level Indicator</h2> {/* Increased heading size and margin */}
                        <div className="flex flex-col items-center justify-center flex-1" style={{ position: 'relative' }}>
                            {showLevelConfetti && levelContainerRef.current && (
                                <motion.div
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3, delay: 1.7 }} // fade out over last 0.3s of 2s
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        pointerEvents: 'none',
                                        zIndex: 10,
                                    }}
                                >
                                    <Confetti
                                        width={levelContainerRef.current.offsetWidth}
                                        height={levelContainerRef.current.offsetHeight}
                                        numberOfPieces={90}
                                        recycle={false}
                                        gravity={0.25}
                                        tweenDuration={400}
                                        initialVelocityX={12}
                                        initialVelocityY={12}
                                        confettiSource={{
                                            x: levelContainerRef.current.offsetWidth / 2 - 10,
                                            y: levelContainerRef.current.offsetHeight / 2 - 10,
                                            w: 20,
                                            h: 20,
                                        }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            pointerEvents: 'none',
                                            zIndex: 10,
                                        }}
                                    />
                                </motion.div>
                            )}
                            <span className={cn('px-10 py-4 rounded-full text-3xl font-extrabold shadow-md mb-4', level.color)}>{level.title}</span> {/* Increased badge size and font */}
                            <span className="text-gray-500 text-lg text-center">Keep going to level up your career journey.</span> {/* Increased text size */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popups */}
            <Dialog open={showCongrats} onOpenChange={handleCloseCongrats}>
                <DialogContent className="flex flex-col items-center justify-center max-w-md w-full border-2 shadow-2xl bg-white dark:bg-slate-900">
                    <DialogTitle className="text-2xl font-bold text-center mb-2">Congratulations!</DialogTitle>
                    <p className="text-base text-center mb-4">You completed all subtasks for <span className="font-semibold text-[#7c3aed]">{congratsTask}</span>!</p>
                    <Button className="bg-[#7c3aed] text-white hover:bg-[#5330cf]" onClick={handleCloseCongrats} autoFocus>Awesome!</Button>
                </DialogContent>
            </Dialog>
            <Dialog open={showAllDone} onOpenChange={handleCloseAllDone}>
                <DialogContent className="flex flex-col items-center justify-center max-w-md w-full border-2 shadow-2xl bg-white dark:bg-slate-900">
                    <DialogTitle className="text-2xl font-bold text-center mb-2">All Tasks Done!</DialogTitle>
                    <p className="text-base text-center mb-4">Ready to take your career to the next level?</p>
                    <Button className="bg-[#7c3aed] text-white hover:bg-[#5330cf] text-lg px-8 py-3 mt-2" onClick={handleGenerateNextTasks} autoFocus>Generate More Tasks</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

