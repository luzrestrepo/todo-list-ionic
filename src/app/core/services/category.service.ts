import { Injectable, signal } from '@angular/core';

import { Category } from '../models/category.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  private readonly storageKey = 'todo_categories';

  private readonly categoriesState = signal<Category[]>([]);

  readonly categories = this.categoriesState.asReadonly();

  constructor(private readonly storageService: StorageService) {
    this.loadCategories();
  }

  addCategory(name: string): void {
    const category: Category = {
      id: crypto.randomUUID(),
      name: name.trim()
    };

    const categories = [...this.categoriesState(), category];

    this.categoriesState.set(categories);
    this.persistCategories(categories);
  }

  updateCategory(id: string, name: string): void {
    const categories = this.categoriesState().map(category =>
      category.id === id
        ? { ...category, name: name.trim() }
        : category
    );

    this.categoriesState.set(categories);
    this.persistCategories(categories);
  }

  deleteCategory(id: string): void {
    const categories = this.categoriesState().filter(
      category => category.id !== id
    );

    this.categoriesState.set(categories);
    this.persistCategories(categories);
  }

  private loadCategories(): void {
    const categories =
      this.storageService.get<Category[]>(this.storageKey);

    if (categories) {
      this.categoriesState.set(categories);
    }
  }

  private persistCategories(categories: Category[]): void {
    this.storageService.set(this.storageKey, categories);
  }
}