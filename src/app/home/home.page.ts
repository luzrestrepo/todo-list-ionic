import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonLabel,
  IonItem,
  IonList,
  IonTitle,
  IonToolbar,
  IonListHeader,
} from '@ionic/angular/standalone';

import { TaskService } from '../core/services/task.service';
import { CategoryService } from '../core/services/category.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonList,
    IonLabel,
    IonListHeader
  ]
})
export class HomePage {
  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);

  readonly tasks = this.taskService.tasks;
  readonly categories = this.categoryService.categories;

  newTaskTitle = '';
  newCategoryName = '';

  editingCategoryId: string | null = null;
  editingCategoryName = '';

  addTask(): void {
    const title = this.newTaskTitle.trim();

    if (!title) {
      return;
    }

    this.taskService.addTask(title);
    this.newTaskTitle = '';
  }

  toggleTask(id: string): void {
    this.taskService.toggleTask(id);
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id);
  }

  addCategory(): void {
    const name = this.newCategoryName.trim();

    if (!name) {
      return;
    }

    this.categoryService.addCategory(name);
    this.newCategoryName = '';
  }

  startEditingCategory(
    categoryId: string,
    categoryName: string
  ): void {
    this.editingCategoryId = categoryId;
    this.editingCategoryName = categoryName;
  }

  saveCategory(): void {
    if (!this.editingCategoryId) {
      return;
    }

    const name = this.editingCategoryName.trim();

    if (!name) {
      return;
    }

    this.categoryService.updateCategory(
      this.editingCategoryId,
      name
    );

    this.cancelEditingCategory();
  }

  cancelEditingCategory(): void {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
  }

  deleteCategory(id: string): void {
    this.categoryService.deleteCategory(id);
  }
}
