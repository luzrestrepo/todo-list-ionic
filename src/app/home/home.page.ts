import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  addOutline,
  checkmarkCircle,
  checkmarkOutline,
  clipboardOutline,
  closeOutline,
  createOutline,
  ellipseOutline,
  funnelOutline,
  pricetagOutline,
  trashOutline
} from 'ionicons/icons';
import {
  IonBadge,
  IonButton,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonItem,
  IonTitle,
  IonToolbar,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';

import { Task } from '../core/models/task.model';
import { TaskService } from '../core/services/task.service';
import { CategoryService } from '../core/services/category.service';
import { RemoteConfigService } from '../core/services/remote-config.service';

const VIRTUAL_SCROLL_THRESHOLD = 30;

addIcons({
  'add-circle-outline': addCircleOutline,
  'add-outline': addOutline,
  'checkmark-circle': checkmarkCircle,
  'checkmark-outline': checkmarkOutline,
  'clipboard-outline': clipboardOutline,
  'close-outline': closeOutline,
  'create-outline': createOutline,
  'ellipse-outline': ellipseOutline,
  'funnel-outline': funnelOutline,
  'pricetag-outline': pricetagOutline,
  'trash-outline': trashOutline
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ScrollingModule,
    NgTemplateOutlet,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonChip,
    IonBadge
  ]
})
export class HomePage {
  private readonly taskService = inject(TaskService);
  private readonly categoryService = inject(CategoryService);
  private readonly remoteConfigService = inject(RemoteConfigService);
  
  readonly showCategories = signal(true);
  readonly tasks = this.taskService.tasks;
  readonly categories = this.categoryService.categories;

  readonly selectedCategoryId = signal<string | undefined>(undefined);
  readonly selectedFilterCategoryId = signal<string | undefined>(undefined);

  readonly filteredTasks = computed(() => {
    const categoryId = this.selectedFilterCategoryId();
    const tasks = this.tasks();

    if (!categoryId) {
      return tasks;
    }

    return tasks.filter(task => task.categoryId === categoryId);
  });

  readonly useVirtualScroll = computed(
    () => this.filteredTasks().length > VIRTUAL_SCROLL_THRESHOLD
  );

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
      this.selectedCategoryId()
    );

    this.newTaskTitle = '';
    this.selectedCategoryId.set(undefined);
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

  trackByTaskId(_index: number, task: Task): string {
    return task.id;
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
    const enabled = await this.remoteConfigService.getFeatureFlag(
      'enable_task_categories'
    );

    this.showCategories.set(enabled);
  }
}
