import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../services/product';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { ToastService } from '../../services/toast.service';
import { finalize } from 'rxjs/operators';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss']
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;
  loading = false;
  error: string | null = null;
  quantity = 1;
  selectedImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) this.loadProduct(params['id']);
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.error = null;
    this.productService.getProductById(id)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: (response) => {
          this.product = response.data || response;
          this.quantity = 1;
          this.selectedImageIndex = 0;
        },
        error: () => { this.error = 'Product not found or failed to load.'; }
      });
  }

  get productImages(): string[] {
    if (!this.product) return [];
    return this.product.images && this.product.images.length > 0
      ? this.product.images
      : [this.product.image || 'assets/images/placeholder.png'];
  }

  get currentImage(): string {
    return this.productImages[this.selectedImageIndex] || 'assets/images/placeholder.png';
  }

  selectImage(index: number): void { this.selectedImageIndex = index; }

  getDiscountPercentage(): number {
    if (!this.product) return 0;
    if (this.product.discountPercentage) return this.product.discountPercentage;
    if (this.product.discountType === 'percentage' && this.product.discountValue) return this.product.discountValue;
    if (this.product.discountType === 'fixed' && this.product.discountValue)
      return Math.round((this.product.discountValue / this.product.price) * 100);
    if (this.product.discountPrice)
      return Math.round(((this.product.price - this.product.discountPrice) / this.product.price) * 100);
    return 0;
  }

  getDiscountedPrice(): number {
    if (!this.product) return 0;
    if (this.product.discountPrice) return this.product.discountPrice;
    if (this.product.discountType === 'percentage' && this.product.discountValue)
      return this.product.price - (this.product.price * (this.product.discountValue / 100));
    if (this.product.discountType === 'fixed' && this.product.discountValue)
      return this.product.price - this.product.discountValue;
    return this.product.price;
  }

  get isInStock(): boolean {
    if (!this.product) return false;
    return (this.product.stock !== undefined ? this.product.stock : 1) > 0;
  }

  get isInWishlist(): boolean {
    return this.product ? this.wishlistService.isInWishlist(this.product._id || this.product.id || '') : false;
  }

  incrementQuantity(): void {
    const max = this.product?.stock ?? 99;
    if (this.quantity < max) this.quantity++;
  }

  decrementQuantity(): void { if (this.quantity > 1) this.quantity--; }

  addToCart(): void {
    if (!this.product) return;
    for (let i = 0; i < this.quantity; i++) this.cartService.addToCart(this.product);
    this.toastService.success(`${this.quantity} item(s) added to cart!`);
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/cart']);
  }

  toggleWishlist(event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.product) return;
    const added = this.wishlistService.toggleWishlist(this.product);
    this.toastService.info(added ? 'Added to wishlist!' : 'Removed from wishlist.', 2200);
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

  get cartItemCount(): number { return this.cartService.cartCount(); }
  get wishlistCount(): number { return this.wishlistService.wishlistCount(); }

  viewCart(): void { this.router.navigate(['/cart']); }
  viewWishlist(): void { this.router.navigate(['/wishlist']); }
  navigateBack(): void { window.history.back(); }
}
