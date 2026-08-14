import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly app: FirebaseApp = initializeApp(environment.firebase);

  getApp(): FirebaseApp {
    return this.app;
  }
}