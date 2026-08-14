import { Injectable, inject } from '@angular/core';
import type { RemoteConfig } from 'firebase/remote-config';

import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {
  private readonly firebaseService = inject(FirebaseService);

  private remoteConfigPromise?: Promise<RemoteConfig>;

  async getFeatureFlag(key: string): Promise<boolean> {
    const { fetchAndActivate, getBoolean } = await import(
      'firebase/remote-config'
    );
    const remoteConfig = await this.resolveRemoteConfig();

    try {
      await fetchAndActivate(remoteConfig);
    } catch (error) {
      console.warn(
        `No fue posible obtener Remote Config para "${key}". Se utilizará el valor predeterminado.`,
        error
      );
    }

    return getBoolean(remoteConfig, key);
  }

  private async resolveRemoteConfig(): Promise<RemoteConfig> {
    if (!this.remoteConfigPromise) {
      this.remoteConfigPromise = Promise.all([
        this.firebaseService.getApp(),
        import('firebase/remote-config')
      ]).then(([app, { getRemoteConfig }]) => {
        const remoteConfig = getRemoteConfig(app);

        remoteConfig.defaultConfig = { enable_task_categories: true };
        remoteConfig.settings.minimumFetchIntervalMillis = 0;

        return remoteConfig;
      });
    }

    return this.remoteConfigPromise;
  }
}
