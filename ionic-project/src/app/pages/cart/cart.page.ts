import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../auth/services/auth';
import { ToastService } from '../../services/toast.service';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../components/shimmer';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ThemeButtonComponent, ShimmerComponent],
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss']
})
export class CartPage implements OnInit {
  isLoading = true;

  constructor(
    public cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  get cartItems() {
    return this.cartService.items();
  }

  getProductId(item: any): string {
    return item.product._id || item.product.id || '';
  }

  getProductImage(item: any): string {
    return item.product.image || (item.product.images && item.product.images[0]) || 'assets/images/placeholder.png';
  }

  getDiscountedPrice(item: any): number {
    const p = item.product;
    if (p.discountPrice) return p.discountPrice;
    if (p.discountType === 'percentage' && p.discountValue) {
      return p.price - (p.price * (p.discountValue / 100));
    }
    if (p.discountType === 'fixed' && p.discountValue) {
      return p.price - p.discountValue;
    }
    return p.price;
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
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/sign-in'], { queryParams: { returnUrl: '/checkout' } });
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
