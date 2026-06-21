import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WishlistService, WishlistItem } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { finalize } from 'rxjs/operators';
import { ThemeButtonComponent } from '../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeButtonComponent],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.error = null;

    this.wishlistService.getWishlist()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (items) => {
          this.wishlistItems = items;
        },
        error: (err) => {
          this.error = 'Failed to load wishlist';
          this.toastService.error('Failed to load wishlist');
        }
      });
  }

  removeFromWishlist(productId: string): void {
    if (!confirm('Remove this item from wishlist?')) {
      return;
    }

    this.wishlistService.removeFromWishlist(productId).subscribe({      next: () => {
        this.wishlistItems = this.wishlistItems.filter(item => item.productId !== productId);
        this.toastService.success('Item removed from wishlist');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.error('Failed to remove item from wishlist');
      }
    });
  }

  addToCart(item: WishlistItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.cartService.addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      discountValue: item.discountValue,
      discountType: item.discountType
    });

    this.toastService.success('Product added to cart!');
  }

  moveToCart(item: WishlistItem): void {
    this.addToCart(item);
    this.removeFromWishlist(item.productId);
  }

  clearWishlist(): void {
    if (!confirm('Are you sure you want to clear your wishlist?')) {
      return;
    }

    this.wishlistService.clearWishlist().subscribe({
      next: () => {
        this.wishlistItems = [];
        this.toastService.success('Wishlist cleared');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.error('Failed to clear wishlist');
      }
    });
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/shop/product', productId]);
  }

  navigateBack(): void {
    window.history.back();
  }

  continueShopping(): void {
    this.router.navigate(['/home']);
  }

  getDiscountedPrice(item: WishlistItem): number {
    if (!item.discountValue) return item.price;
    
    if (item.discountType === 'percentage') {
      return item.price - (item.price * (item.discountValue / 100));
    } else if (item.discountType === 'fixed') {
      return item.price - item.discountValue;
    }
    return item.price;
  }

  getDiscountPercentage(item: WishlistItem): number {
    if (!item.discountValue) return 0;
    
    if (item.discountType === 'percentage') {
      return item.discountValue;
    } else if (item.discountType === 'fixed') {
      return Math.round((item.discountValue / item.price) * 100);
    }
    return 0;
  }

  get cartItemCount(): number {
    return this.cartService.itemCount();
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }
}
