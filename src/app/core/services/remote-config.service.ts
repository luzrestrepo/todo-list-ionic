import { Injectable, inject } from '@angular/core';
import {
  getRemoteConfig,
  fetchAndActivate,
  getBoolean,
  RemoteConfig
} from 'firebase/remote-config';

import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {
  private readonly firebaseService = inject(FirebaseService);

  private readonly remoteConfig: RemoteConfig;

  constructor() {
    this.remoteConfig = getRemoteConfig(
      this.firebaseService.getApp()
    );

    this.remoteConfig.defaultConfig = {
      enable_task_categories: true
    };

    this.remoteConfig.settings.minimumFetchIntervalMillis = 0;
  }

  async getFeatureFlag(key: string): Promise<boolean> {
    try {
      await fetchAndActivate(this.remoteConfig);

      return getBoolean(this.remoteConfig, key);
    } catch (error) {
      console.warn(
        `No fue posible obtener Remote Config para "${key}". Se utilizará el valor predeterminado.`,
        error
      );

      return getBoolean(this.remoteConfig, key);
    }
  }
}