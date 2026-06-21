import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  discountValue?: number;
  discountType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  
  // Computed signals for cart calculations
  items = this.cartItems.asReadonly();
  
  itemCount = computed(() => 
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );
  
  subtotal = computed(() =>
    this.cartItems().reduce((total, item) => {
      const itemPrice = this.getDiscountedPrice(item);
      return total + (itemPrice * item.quantity);
    }, 0)
  );
  
  tax = computed(() => this.subtotal() * 0.18); // 18% tax
  
  total = computed(() => this.subtotal() + this.tax());

  constructor() {
    // Load cart from localStorage on initialization
    this.loadCart();
  }

  private getDiscountedPrice(item: CartItem): number {
    if (!item.discountValue || item.discountValue === 0) {
      return item.price;
    }
    
    if (item.discountType === 'percentage') {
      return item.price - (item.price * item.discountValue / 100);
    } else {
      return item.price - item.discountValue;
    }
  }

  addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(
      i => i.productId === item.productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += item.quantity || 1;
      this.cartItems.set(updatedItems);
    } else {
      // Add new item
      this.cartItems.set([
        ...currentItems,
        { ...item, quantity: item.quantity || 1 } as CartItem
      ]);
    }

    this.saveCart();
  }

  removeFromCart(productId: string): void {
    this.cartItems.update(items => items.filter(item => item.productId !== productId));
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
    this.saveCart();
  }

  incrementQuantity(productId: string): void {
    this.cartItems.update(items =>
      items.map(item =>
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
    this.saveCart();
  }

  decrementQuantity(productId: string): void {
    const item = this.cartItems().find(i => i.productId === productId);
    if (item && item.quantity > 1) {
      this.cartItems.update(items =>
        items.map(i =>
          i.productId === productId 
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      );
      this.saveCart();
    } else {
      this.removeFromCart(productId);
    }
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveCart();
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems()));
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        this.cartItems.set(items);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }
}
