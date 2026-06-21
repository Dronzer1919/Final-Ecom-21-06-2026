import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';import { ThemeButtonComponent } from '../components/buttons/theme-button/theme-button.component';import { CartService } from '../services/cart.service';
import { AuthService } from '../auth/services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeButtonComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  cartService = inject(CartService);
  router = inject(Router);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  get cartItems() {
    return this.cartService.items();
  }

  get itemCount() {
    return this.cartService.itemCount();
  }

  get subtotal() {
    return this.cartService.subtotal();
  }

  get tax() {
    return this.cartService.tax();
  }

  get total() {
    return this.cartService.total();
  }

  incrementQuantity(productId: string): void {
    this.cartService.incrementQuantity(productId);
  }

  decrementQuantity(productId: string): void {
    this.cartService.decrementQuantity(productId);
  }

  removeItem(productId: string): void {
    if (confirm('Remove this item from cart?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.toastService.warning('Your cart is empty!');
      return;
    }
    
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      // Redirect to login with returnUrl
      this.router.navigate(['/auth/signin'], { 
        queryParams: { returnUrl: '/checkout' } 
      });
      return;
    }
    
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/home']);
  }

  navigateBack(): void {
    window.history.back();
  }
}
