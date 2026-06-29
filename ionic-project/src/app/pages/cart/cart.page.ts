import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../auth/services/auth';
import { ToastService } from '../../services/toast.service';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../components/shimmer';
import { ConfirmDialogComponent } from '../../dashboard/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ThemeButtonComponent, ShimmerComponent, ConfirmDialogComponent],
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss']
})
export class CartPage implements OnInit {
  isLoading = true;
  removeConfirmId: string | null = null;

  constructor(
    public cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.isLoading = false;
  }

  get cartItems() {
    return this.cartService.items();
  }

  getProductId(item: any): string {
    return item.productId || '';
  }

  getProductImage(item: any): string {
    return item.image || 'assets/images/placeholder.png';
  }

  getDiscountedPrice(item: any): number {
    if (!item.discountValue || item.discountValue === 0) return item.price;
    if (item.discountType === 'percentage') {
      return item.price - (item.price * item.discountValue / 100);
    }
    return item.price - item.discountValue;
  }

  incrementQuantity(productId: string): void {
    this.cartService.incrementQuantity(productId);
  }

  decrementQuantity(productId: string): void {
    this.cartService.decrementQuantity(productId);
  }

  removeItem(productId: string): void {
    this.removeConfirmId = productId;
  }

  confirmRemove(): void {
    if (this.removeConfirmId) {
      this.cartService.removeFromCart(this.removeConfirmId);
      this.removeConfirmId = null;
    }
  }

  cancelRemove(): void {
    this.removeConfirmId = null;
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
