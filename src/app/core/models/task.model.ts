export interface Task {
    id: number;
    title: string;
    completed: boolean;
    categoryId?: string;
    createdAt: number;
}