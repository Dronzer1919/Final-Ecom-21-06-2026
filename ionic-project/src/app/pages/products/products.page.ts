import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../services/product';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { ToastService } from '../../services/toast.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ShimmerComponent } from '../../components/shimmer';
import { ThemeButtonComponent } from '../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ShimmerComponent, ThemeButtonComponent],
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss']
})
export class ProductsPage implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('loadTrigger', { static: false }) loadTrigger?: ElementRef<HTMLDivElement>;

  products: Product[] = [];
  loading = false;
  loadingMore = false;
  error: string | null = null;
  hasMoreData = true;

  currentPage = 1;
  pageSize = 12;
  totalProducts = 0;

  private observerAttached = false;

  private destroy$ = new Subject<void>();
  private observer: IntersectionObserver | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public wishlistService: WishlistService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadProducts(); }

  ngAfterViewChecked(): void {
    if (this.loadTrigger && !this.observerAttached) {
      this.observerAttached = true;
      this.initInfiniteScrollObserver();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initInfiniteScrollObserver(): void {
    if (!this.loadTrigger) return;
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) this.loadMoreProducts(); },
      { root: null, threshold: 0.1, rootMargin: '0px 0px 220px 0px' }
    );
    this.observer.observe(this.loadTrigger.nativeElement);
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    this.currentPage = 1;
    this.products = [];
    this.hasMoreData = true;
    this.observerAttached = false;
    this.observer?.disconnect();
    this.observer = null;

    this.productService.getAllProducts(this.currentPage, this.pageSize)
      .pipe(finalize(() => { this.loading = false; }), takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const data = response.data;
          this.products = Array.isArray(data) ? data : (data || []);
          this.totalProducts = response.pagination?.total || this.products.length;
          this.hasMoreData = (this.currentPage * this.pageSize) < this.totalProducts;
        },
        error: () => { this.error = 'Failed to load products. Please try again.'; }
      });
  }

  loadMoreProducts(): void {
    if (this.loadingMore || !this.hasMoreData) return;
    this.loadingMore = true;
    this.currentPage++;

    this.productService.getAllProducts(this.currentPage, this.pageSize)
      .pipe(finalize(() => { this.loadingMore = false; }), takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const data = response.data;
          const newProducts = Array.isArray(data) ? data : [];
          this.products = [...this.products, ...newProducts];
          this.totalProducts = response.pagination?.total || this.totalProducts;
          this.hasMoreData = (this.currentPage * this.pageSize) < this.totalProducts;
        },
        error: () => { this.currentPage--; }
      });
  }

  getProductId(product: Product): string {
    return product._id || product.id || '';
  }

  getProductImage(product: Product): string {
    return product.image || (product.images && product.images[0]) || 'assets/images/product-placeholder.svg';
  }

  getDiscountedPrice(product: Product): number {
    if (product.discountPrice) return product.discountPrice;
    if (product.discountType === 'percentage' && product.discountValue)
      return product.price - (product.price * (product.discountValue / 100));
    if (product.discountType === 'fixed' && product.discountValue)
      return product.price - product.discountValue;
    return product.price;
  }

  getDiscountPercentage(product: Product): number {
    if (product.discountPercentage) return product.discountPercentage;
    if (product.discountType === 'percentage' && product.discountValue) return product.discountValue;
    if (product.discountType === 'fixed' && product.discountValue)
      return Math.round((product.discountValue / product.price) * 100);
    if (product.discountPrice && product.price)
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    return 0;
  }

  isInWishlist(productId: string): boolean { return this.wishlistService.isInWishlist(productId); }

  toggleWishlist(product: Product, event: Event): void {
    event.stopPropagation();
    const added = this.wishlistService.toggleWishlist(product);
    this.toastService.info(added ? 'Added to wishlist!' : 'Removed from wishlist.', 2200);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
    this.toastService.success('Product added to cart!', 2200);
  }

  navigateToProduct(productId: string): void { this.router.navigate(['/shop/product', productId]); }
  navigateHome(): void { this.router.navigate(['/home']); }
}
