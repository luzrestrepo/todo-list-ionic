import { Injectable, signal } from '@angular/core';

import { Task } from '../models/task.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly storageKey = 'todo_tasks';

  private readonly tasksState = signal<Task[]>([]);

  readonly tasks = this.tasksState.asReadonly();

  constructor(private readonly storageService: StorageService) {
    this.loadTasks();
  }

  addTask(title: string, categoryId?: string): void {
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
      categoryId
    };
  
    const tasks = [...this.tasksState(), task];
  
    this.tasksState.set(tasks);
    this.persistTasks(tasks);
  }

  toggleTask(id: string): void {
    const tasks = this.tasksState().map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    );

    this.tasksState.set(tasks);
    this.persistTasks(tasks);
  }

  setCategory(id: string, categoryId: string | undefined): void {
    const tasks = this.tasksState().map(task =>
      task.id === id
        ? { ...task, categoryId }
        : task
    );
  
    this.tasksState.set(tasks);
    this.persistTasks(tasks);
  }

  deleteTask(id: string): void {
    const tasks = this.tasksState().filter(task => task.id !== id);

    this.tasksState.set(tasks);
    this.persistTasks(tasks);
  }

  private loadTasks(): void {
    const tasks = this.storageService.get<Task[]>(this.storageKey);

    if (tasks) {
      this.tasksState.set(tasks);
    }
  }

  private persistTasks(tasks: Task[]): void {
    this.storageService.set(this.storageKey, tasks);
  }
}