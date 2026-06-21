import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/services/auth.service';

export interface WishlistItem {
  _id?: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  discountValue?: number;
  discountType?: 'percentage' | 'fixed';
  brand?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiUrl = `${environment.apiUrl}/wishlist`;
  private dbName = 'WishlistDB';
  private storeName = 'wishlist';
  private db: IDBDatabase | null = null;

  // Signal to track wishlist items count
  private wishlistCountSignal = signal<number>(0);
  wishlistCount = this.wishlistCountSignal.asReadonly();

  constructor() {
    this.initIndexedDB();
    this.updateWishlistCount();
  }

  // Initialize IndexedDB
  private initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'productId' });
          objectStore.createIndex('productId', 'productId', { unique: true });
        }
      };
    });
  }

  // Get user's wishlist
  getWishlist(): Observable<WishlistItem[]> {
    if (this.authService.isAuthenticated()) {
      // Get from backend
      return this.http.get<any>(this.apiUrl).pipe(
        map(response => {
          const items = response.data.map((item: any) => ({
            _id: item._id,
            productId: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.images?.[0] || 'assets/images/product-placeholder.jpg',
            discountValue: item.product.discountValue,
            discountType: item.product.discountType,
            brand: item.product.brand?.name,
            category: item.product.category?.name
          }));
          this.wishlistCountSignal.set(items.length);
          return items;
        }),
        catchError(err => {
          console.error('Error fetching wishlist from API:', err);
          return of([]);
        })
      );
    } else {
      // Get from IndexedDB
      return from(this.getFromIndexedDB()).pipe(
        map(items => {
          this.wishlistCountSignal.set(items.length);
          return items;
        })
      );
    }
  }

  // Add to wishlist
  addToWishlist(item: WishlistItem): Observable<any> {
    if (this.authService.isAuthenticated()) {
      // Add to backend
      return this.http.post<any>(this.apiUrl, { productId: item.productId }).pipe(
        map(response => {
          this.updateWishlistCount();
          return response;
        })
      );
    } else {
      // Add to IndexedDB
      return from(this.addToIndexedDB(item)).pipe(
        map(() => {
          this.updateWishlistCount();
          return { success: true, message: 'Added to wishlist' };
        })
      );
    }
  }

  // Remove from wishlist
  removeFromWishlist(productId: string): Observable<any> {
    if (this.authService.isAuthenticated()) {
      // Remove from backend
      return this.http.delete<any>(`${this.apiUrl}/${productId}`).pipe(
        map(response => {
          this.updateWishlistCount();
          return response;
        })
      );
    } else {
      // Remove from IndexedDB
      return from(this.removeFromIndexedDB(productId)).pipe(
        map(() => {
          this.updateWishlistCount();
          return { success: true, message: 'Removed from wishlist' };
        })
      );
    }
  }

  // Check if product is in wishlist
  isInWishlist(productId: string): Observable<boolean> {
    if (this.authService.isAuthenticated()) {
      // Check backend
      return this.http.get<any>(`${this.apiUrl}/check/${productId}`).pipe(
        map(response => response.data.isInWishlist),
        catchError(() => of(false))
      );
    } else {
      // Check IndexedDB
      return from(this.isInIndexedDB(productId));
    }
  }

  // Sync wishlist from IndexedDB to backend after login
  syncWishlistOnLogin(): Observable<any> {
    return from(this.getFromIndexedDB()).pipe(
      switchMap(items => {
        if (items.length === 0) {
          return of({ success: true, message: 'No items to sync' });
        }

        const productIds = items.map(item => item.productId);
        
        return this.http.post<any>(`${this.apiUrl}/bulk`, { productIds }).pipe(
          switchMap(response => {
            // Clear IndexedDB after successful sync
            return from(this.clearIndexedDB()).pipe(
              map(() => {
                this.updateWishlistCount();
                return response;
              })
            );
          })
        );
      })
    );
  }

  // Clear wishlist
  clearWishlist(): Observable<any> {
    if (this.authService.isAuthenticated()) {
      return this.http.delete<any>(this.apiUrl).pipe(
        map(response => {
          this.updateWishlistCount();
          return response;
        })
      );
    } else {
      return from(this.clearIndexedDB()).pipe(
        map(() => {
          this.updateWishlistCount();
          return { success: true, message: 'Wishlist cleared' };
        })
      );
    }
  }

  // Update wishlist count
  private updateWishlistCount(): void {
    this.getWishlist().subscribe(items => {
      this.wishlistCountSignal.set(items.length);
    });
  }

  // IndexedDB Helper Methods
  private getFromIndexedDB(): Promise<WishlistItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initIndexedDB().then(() => this.getFromIndexedDB()).then(resolve).catch(reject);
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error reading from IndexedDB');
        resolve([]);
      };
    });
  }

  private addToIndexedDB(item: WishlistItem): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initIndexedDB().then(() => this.addToIndexedDB(item)).then(resolve).catch(reject);
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.put(item);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Error adding to IndexedDB');
        reject(request.error);
      };
    });
  }

  private removeFromIndexedDB(productId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initIndexedDB().then(() => this.removeFromIndexedDB(productId)).then(resolve).catch(reject);
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.delete(productId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Error removing from IndexedDB');
        reject(request.error);
      };
    });
  }

  private isInIndexedDB(productId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.db) {
        this.initIndexedDB().then(() => this.isInIndexedDB(productId)).then(resolve).catch(() => resolve(false));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get(productId);

      request.onsuccess = () => {
        resolve(!!request.result);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  }

  private clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initIndexedDB().then(() => this.clearIndexedDB()).then(resolve).catch(reject);
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Error clearing IndexedDB');
        reject(request.error);
      };
    });
  }
}
