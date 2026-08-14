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
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';

import { TaskService } from '../core/services/task.service';
import { CategoryService } from '../core/services/category.service';
import { RemoteConfigService } from '../core/services/remote-config.service';

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
    IonListHeader,
    IonSelect,
    IonSelectOption
  ]
})
export class HomePage {
  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);
  private readonly remoteConfigService = inject(RemoteConfigService);

  showCategories = false;
  readonly tasks = this.taskService.tasks;
  readonly categories = this.categoryService.categories;

 

  selectedCategoryId: string | undefined;
  selectedFilterCategoryId: string | undefined;

  newTaskTitle = '';
  newCategoryName = '';
  constructor() {
    this.loadFeatureFlags();
  }


  editingCategoryId: string | null = null;
  editingCategoryName = '';

  addTask(): void {
    const title = this.newTaskTitle.trim();
  
    if (!title) {
      return;
    }
  
    this.taskService.addTask(
      title,
      this.selectedCategoryId
    );
  
    this.newTaskTitle = '';
    this.selectedCategoryId = undefined;
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

  get filteredTasks() {
    const categoryId = this.selectedFilterCategoryId;
  
    if (!categoryId) {
      return this.tasks();
    }
  
    return this.tasks().filter(
      task => task.categoryId === categoryId
    );
  }

  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) {
      return 'Sin categoría';
    }
  
    const category = this.categories().find(
      category => category.id === categoryId
    );
  
    return category?.name ?? 'Sin categoría';
  }

  private async loadFeatureFlags(): Promise<void> {
    this.showCategories =
      await this.remoteConfigService.getFeatureFlag(
        'enable_task_categories'
      );
  }
}
