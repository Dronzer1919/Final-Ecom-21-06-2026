import { Injectable, signal, computed } from '@angular/core';
import { Product } from './product';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private wishlistItems = signal<Product[]>([]);
  
  wishlistCount = computed(() => this.wishlistItems().length);

  constructor() {
    this.loadWishlist();
  }

  private loadWishlist() {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      this.wishlistItems.set(JSON.parse(saved));
    }
  }

  private saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems()));
  }

  private getProductId(product: Product): string | null {
    return product._id || product.id || null;
  }

  addToWishlist(product: Product) {
    const productId = this.getProductId(product);
    if (!productId) {
      return false;
    }

    if (!this.isInWishlist(productId)) {
      this.wishlistItems.set([...this.wishlistItems(), product]);
      this.saveWishlist();
      return true;
    }
    return false;
  }

  removeFromWishlist(productId: string) {
    this.wishlistItems.set(
      this.wishlistItems().filter((product) => this.getProductId(product) !== productId)
    );
    this.saveWishlist();
  }

  toggleWishlist(product: Product) {
    const productId = this.getProductId(product);
    if (!productId) {
      return false;
    }

    if (this.isInWishlist(productId)) {
      this.removeFromWishlist(productId);
      return false;
    } else {
      this.addToWishlist(product);
      return true;
    }
  }

  isInWishlist(productId: string) {
    return this.wishlistItems().some((product) => this.getProductId(product) === productId);
  }

  getWishlistItems() {
    return this.wishlistItems();
  }

  clearWishlist() {
    this.wishlistItems.set([]);
    this.saveWishlist();
  }
}
