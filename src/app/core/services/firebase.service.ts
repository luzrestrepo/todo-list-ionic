import { Injectable } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private appPromise?: Promise<FirebaseApp>;

  getApp(): Promise<FirebaseApp> {
    if (!this.appPromise) {
      this.appPromise = import('firebase/app').then(({ initializeApp }) =>
        initializeApp(environment.firebase)
      );
    }

    return this.appPromise;
  }
}
