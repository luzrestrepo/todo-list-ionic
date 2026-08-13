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
  IonToolbar
} from '@ionic/angular/standalone';

import { TaskService } from '../core/services/task.service';

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
    IonLabel
  ]
})
export class HomePage {
  private readonly taskService = inject(TaskService);

  readonly tasks = this.taskService.tasks;

  newTaskTitle = '';

  addTask(): void {
    const title = this.newTaskTitle.trim();
  
    if (!title) {
      console.log('No hay título');
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
}
