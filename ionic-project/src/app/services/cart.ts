import { Injectable, signal, computed } from '@angular/core';
import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  // Alias for reference-compatible API
  items = this.cartItems;

  cartCount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });

  // Alias
  itemCount = this.cartCount;

  cartTotal = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
  });

  subtotal = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
  });

  tax = computed(() => Math.round(this.subtotal() * 0.18 * 100) / 100);

  total = computed(() => Math.round((this.subtotal() + this.tax()) * 100) / 100);

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartItems.set(JSON.parse(saved));
    }
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems()));
  }

  private getProductId(product: Product): string | null {
    return product._id || product.id || null;
  }

  addToCart(product: Product, quantity: number = 1) {
    const productId = this.getProductId(product);
    if (!productId) {
      return;
    }

    const items = this.cartItems();
    const existingItem = items.find((item) => this.getProductId(item.product) === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      this.cartItems.set([...items]);
    } else {
      this.cartItems.set([...items, { product, quantity }]);
    }
    
    this.saveCart();
  }

  removeFromCart(productId: string) {
    this.cartItems.set(
      this.cartItems().filter((item) => this.getProductId(item.product) !== productId)
    );
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number) {
    const items = this.cartItems();
    const item = items.find((cartItem) => this.getProductId(cartItem.product) === productId);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set([...items]);
      this.saveCart();
    }
  }

  incrementQuantity(productId: string) {
    const items = this.cartItems();
    const item = items.find(i => this.getProductId(i.product) === productId);
    if (item) {
      item.quantity++;
      this.cartItems.set([...items]);
      this.saveCart();
    }
  }

  decrementQuantity(productId: string) {
    const items = this.cartItems();
    const item = items.find(i => this.getProductId(i.product) === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
      this.cartItems.set([...items]);
      this.saveCart();
    }
  }

  getCartItems() {
    return this.cartItems();
  }

  clearCart() {
    this.cartItems.set([]);
    this.saveCart();
  }
}
