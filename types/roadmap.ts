export type TaskStatus = "not_started" | "in_progress" | "done"
export type TaskDifficulty = "easy" | "medium" | "hard"

export interface Subtask {
    id: string;
    label: string;
    done: boolean;
}

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    difficulty: TaskDifficulty;
    subtasks: Subtask[];
}