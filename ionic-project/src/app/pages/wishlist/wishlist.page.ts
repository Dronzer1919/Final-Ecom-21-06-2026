import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../services/wishlist';
import { CartService } from '../../services/cart';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../services/product';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, ThemeButtonComponent],
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss']
})
export class WishlistPage {
  constructor(
    public wishlistService: WishlistService,
    private cartService: CartService,
    private toastService: ToastService,
    private router: Router
  ) {}

  get wishlistItems(): Product[] {
    return this.wishlistService.getWishlistItems();
  }

  getProductId(product: Product): string {
    return product._id || product.id || '';
  }

  getProductImage(product: Product): string {
    return product.image || (product.images && product.images[0]) || 'assets/images/product-placeholder.svg';
  }

  getDiscountedPrice(product: Product): number {
    if (product.discountPrice) return product.discountPrice;
    if (product.discountType === 'percentage' && product.discountValue) {
      return product.price - (product.price * (product.discountValue / 100));
    }
    if (product.discountType === 'fixed' && product.discountValue) {
      return product.price - product.discountValue;
    }
    return product.price;
  }

  getDiscountPercentage(product: Product): number {
    if (product.discountPercentage) return product.discountPercentage;
    if (product.discountType === 'percentage' && product.discountValue) return product.discountValue;
    if (product.discountType === 'fixed' && product.discountValue) {
      return Math.round((product.discountValue / product.price) * 100);
    }
    if (product.discountPrice && product.price) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  }

  removeFromWishlist(productId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Remove this item from wishlist?')) {
      this.wishlistService.removeFromWishlist(productId);
      this.toastService.success('Item removed from wishlist');
    }
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
    this.toastService.success('Product added to cart!');
  }

  moveToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
    this.wishlistService.removeFromWishlist(this.getProductId(product));
    this.toastService.success('Moved to cart!');
  }

  clearWishlist(): void {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      this.wishlistService.clearWishlist();
      this.toastService.success('Wishlist cleared');
    }
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/shop/product', productId]);
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.router.navigate(['/home']);
  }

  navigateBack(): void {
    window.history.back();
  }
}
