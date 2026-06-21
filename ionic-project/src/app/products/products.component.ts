import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { ToastService } from '../services/toast.service';
import { finalize } from 'rxjs/operators';
import { ThemeButtonComponent } from '../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ThemeButtonComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalProducts = 0;
  totalPages = 0;
  pages: number[] = [];
  wishlistProductIds: Set<string> = new Set();
  
  // Make Math available in template
  Math = Math;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadWishlistStatus();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAllProducts(this.currentPage, this.pageSize)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Products response:', response);
          this.products = response.data.products ?? [];
          this.totalProducts = response.data.pagination.totalItems;
          this.totalPages = response.data.pagination.totalPages;
          this.currentPage = response.data.pagination.currentPage;
          this.generatePageNumbers();
        },
        error: (err) => {
          this.error = 'Failed to load products. Please try again.';
          this.toastService.error('Failed to load products');
        }
      });
  }

  generatePageNumbers(): void {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    this.pages = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/shop/product', productId]);
  }

  navigateHome(): void {
    this.router.navigate(['/home']);
  }

  getProductImage(product: Product): string {
    return product.images && product.images.length > 0 
      ? product.images[0] 
      : 'assets/images/product-placeholder.jpg';
  }

  getDiscountPercentage(product: Product): number {
    if (product.discountType === 'percentage') {
      return product.discountValue || 0;
    } else if (product.discountType === 'fixed' && product.discountValue) {
      return Math.round((product.discountValue / product.price) * 100);
    }
    return 0;
  }

  getDiscountedPrice(product: Product): number {
    if (!product.discountValue) return product.price;
    
    if (product.discountType === 'percentage') {
      return product.price - (product.price * (product.discountValue / 100));
    } else if (product.discountType === 'fixed') {
      return product.price - product.discountValue;
    }
    return product.price;
  }

  loadWishlistStatus(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (items) => {
        this.wishlistProductIds = new Set(items.map(item => item.productId));
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Silent error
      }
    });
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistProductIds.has(productId);
  }

  toggleWishlist(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!product._id) return;

    if (this.isInWishlist(product._id)) {
      this.wishlistService.removeFromWishlist(product._id).subscribe({
        next: () => {
          this.wishlistProductIds.delete(product._id!);
          this.toastService.success('Removed from wishlist');
          this.cdr.detectChanges();
        },
        error: (err) => this.toastService.error('Failed to remove from wishlist')
      });
    } else {
      this.wishlistService.addToWishlist({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: this.getProductImage(product),
        discountValue: product.discountValue,
        discountType: product.discountType as 'percentage' | 'fixed' | undefined
      }).subscribe({
        next: () => {
          this.wishlistProductIds.add(product._id!);
          this.toastService.success('Added to wishlist');
          this.cdr.detectChanges();
        },
        error: (err) => this.toastService.error('Failed to add to wishlist')
      });
    }
  }

  addToCart(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!product._id) return;

    this.cartService.addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: this.getProductImage(product),
      discountValue: product.discountValue,
      discountType: product.discountType
    });

    this.toastService.success('Product added to cart!');
  }
}
