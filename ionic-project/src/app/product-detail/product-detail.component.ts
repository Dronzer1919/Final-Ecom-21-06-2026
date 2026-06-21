import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { ToastService } from '../services/toast.service';
import { finalize } from 'rxjs/operators';
import { ThemeButtonComponent } from '../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error: string | null = null;
  quantity = 1;
  selectedImageIndex = 0;
  isProductInWishlist = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.product = response.data;
          this.checkWishlistStatus();
        },
        error: (err) => {
          this.error = 'Product not found or failed to load.';
          this.toastService.error('Failed to load product');
        }
      });
  }

  get productImages(): string[] {
    if (!this.product) return [];
    return this.product.images && this.product.images.length > 0 
      ? this.product.images 
      : ['assets/images/product-placeholder.jpg'];
  }

  get currentImage(): string {
    return this.productImages[this.selectedImageIndex] || 'assets/images/product-placeholder.jpg';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  getDiscountPercentage(): number {
    if (!this.product) return 0;
    
    if (this.product.discountType === 'percentage') {
      return this.product.discountValue || 0;
    } else if (this.product.discountType === 'fixed' && this.product.discountValue) {
      return Math.round((this.product.discountValue / this.product.price) * 100);
    }
    return 0;
  }

  getDiscountedPrice(): number {
    if (!this.product || !this.product.discountValue) return this.product?.price || 0;
    
    if (this.product.discountType === 'percentage') {
      return this.product.price - (this.product.price * (this.product.discountValue / 100));
    } else if (this.product.discountType === 'fixed') {
      return this.product.price - this.product.discountValue;
    }
    return this.product.price;
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.quantity) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product || !this.product._id) {
      this.toastService.error('Cannot add to cart');
      return;
    }

    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart({
        productId: this.product._id,
        name: this.product.name,
        price: this.product.price,
        image: this.currentImage,
        discountValue: this.product.discountValue,
        discountType: this.product.discountType
      });
    }

    this.toastService.success(`${this.quantity} item(s) added to cart!`);
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/cart']);
  }

  navigateBack(): void {
    window.history.back();
  }

  get cartItemCount(): number {
    return this.cartService.itemCount();
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  get isInStock(): boolean {
    return this.product !== null && this.product.quantity > 0;
  }

  getBrandName(): string {
    if (!this.product) return '';
    return typeof this.product.brand === 'string' 
      ? this.product.brand 
      : (this.product.brand as any)?.name || '';
  }

  getCategoryName(): string {
    if (!this.product) return '';
    return typeof this.product.category === 'string' 
      ? this.product.category 
      : (this.product.category as any)?.name || '';
  }

  // Wishlist functionality
  checkWishlistStatus(): void {
    if (this.product && this.product._id) {
      this.wishlistService.isInWishlist(this.product._id).subscribe({
        next: (status) => {
          this.isProductInWishlist = status;
          this.cdr.detectChanges();
        },
        error: (err) => {
          // Silent error
        }
      });
    }
  }

  toggleWishlist(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!this.product || !this.product._id) {
      this.toastService.error('Cannot toggle wishlist');
      return;
    }

    if (this.isProductInWishlist) {
      this.wishlistService.removeFromWishlist(this.product._id).subscribe({
        next: () => {
          this.isProductInWishlist = false;
          this.toastService.success('Removed from wishlist');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastService.error('Failed to remove from wishlist');
        }
      });
    } else {
      this.wishlistService.addToWishlist({
        productId: this.product._id,
        name: this.product.name,
        price: this.product.price,
        image: this.currentImage,
        discountValue: this.product.discountValue,
        discountType: this.product.discountType as 'percentage' | 'fixed' | undefined
      }).subscribe({
        next: () => {
          this.isProductInWishlist = true;
          this.toastService.success('Added to wishlist');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastService.error('Failed to add to wishlist');
        }
      });
    }
  }

  get wishlistCount(): number {
    return this.wishlistService.wishlistCount();
  }

  viewWishlist(): void {
    this.router.navigate(['/wishlist']);
  }
}
