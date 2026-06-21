import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EncryptionService {
  private readonly ENCRYPTION_KEY = 'default-secret-key-32-chars-long!';

  getEncryptionKey(): string {
    return this.ENCRYPTION_KEY;
  }

  encrypt(data: any): string {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
  }

  decrypt(encrypted: string): any {
    try {
      const json = decodeURIComponent(atob(encrypted));
      return JSON.parse(json);
    } catch {
      throw new Error('Invalid encrypted payload');
    }
  }
}
