import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoryService, Category } from '../services/category.service';
import { SubcategoryService, Subcategory } from '../services/subcategory.service';
import { BrandService, Brand } from '../services/brand.service';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { BannerService, Banner } from '../services/banner.service';
import { WishlistService } from '../services/wishlist.service';
import { ToastService } from '../services/toast.service';
import { HeaderComponent } from '../components/header/header.component';
import { ShimmerComponent } from '../components/shimmer';
import { IonContent } from '@ionic/angular/standalone';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ThemeButtonComponent } from '../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, ShimmerComponent, ThemeButtonComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);
  bannerTransition = signal(true);
  bannerSlides: Banner[] = [];
  displayBannerSlides: Banner[] = [];
  topProductsVisible = signal(false);
  dealsVisible = signal(false);
  frequentlyBoughtVisible = signal(false);
  footerVisible = signal(false);

  @ViewChild('topProductsGrid') topProductsGrid!: ElementRef;
  @ViewChild('dealsGrid') dealsGrid!: ElementRef;
  @ViewChild('frequentlyBoughtGrid') frequentlyBoughtGrid!: ElementRef;
  @ViewChild('footerEl') footerEl!: ElementRef;
  private topProductsObserver: IntersectionObserver | null = null;
  private dealsObserver: IntersectionObserver | null = null;
  private frequentlyBoughtObserver: IntersectionObserver | null = null;
  private footerObserver: IntersectionObserver | null = null;

  // Categories
  featuredCategories: Category[] = [];
  
  // Subcategories
  subcategories: Subcategory[] = [];
  
  // Brands
  topBrands: Brand[] = [];
  
  // Products
  todaysDeals: Product[] = [];
  topProducts: Product[] = [];
  frequentlyBought: Product[] = [];
  
  loading = true;
  error: string | null = null;
  wishlistProductIds: Set<string> = new Set();

  displayCategories: Category[] = [];
  displayBrands: Brand[] = [];
  brandLogoErrors = new Set<number>();

  private bannerInterval: ReturnType<typeof setInterval> | null = null;

  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private subcategoryService = inject(SubcategoryService);
  private brandService = inject(BrandService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private bannerService = inject(BannerService);
  private wishlistService = inject(WishlistService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit(): void {
    this.loadData();
    this.loadWishlistStatus();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    
    // Load all data in parallel and wait for all to complete
    forkJoin({
      banners: this.bannerService.getActiveBanners(),
      categories: this.categoryService.getAllCategories(1, 100, undefined, true),
      brands: this.brandService.getAllBrands(1, 100, undefined, true),
      products: this.productService.getAllProducts(1, 100, undefined, true)
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.setupTopProductsObserver();
          this.setupDealsObserver();
          this.setupFrequentlyBoughtObserver();
          this.setupFooterObserver();
        }, 50);
      })
    ).subscribe({
      next: (results) => {
        // Process banners
        this.bannerSlides = results.banners.data || [];
        // Clone first slide at end for seamless loop
        this.displayBannerSlides = [...this.bannerSlides, this.bannerSlides[0] ?? null].filter(Boolean) as Banner[];
        this.startBannerAutoSlide();
        
        // Process categories — duplicate for seamless scroll only when > 5
        this.featuredCategories = results.categories.data.categories;
        this.displayCategories = this.featuredCategories.length > 5
          ? [...this.featuredCategories, ...this.featuredCategories]
          : [...this.featuredCategories];
        
        // Process brands
        this.topBrands = results.brands.data.brands.slice(0, 6);
        this.displayBrands = [...this.topBrands, ...this.topBrands];
        
        // Process products
        const productList: Product[] = Array.isArray(results.products.data) ? results.products.data : [];
        
        // Today's Deals - products with discounts
        this.todaysDeals = productList
          .filter((p: Product) => p.discountValue && p.discountValue > 0)
          .slice(0, 8);

        // Top Products - first 8 active products
        this.topProducts = productList.slice(0, 8);

        // Frequently Bought - random selection for now
        this.frequentlyBought = [...productList]
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);
      },
      error: (err: any) => {
        this.error = 'Failed to load data. Please check if the backend server is running on http://localhost:3000';
        this.toastService.error('Failed to load data. Please check your connection.');
      }
    });
  }

  // Banner navigation
  nextSlide(): void {
    this.currentSlide.set((this.currentSlide() + 1) % this.bannerSlides.length);
  }

  prevSlide(): void {
    this.currentSlide.set((this.currentSlide() - 1 + this.bannerSlides.length) % this.bannerSlides.length);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }

  onBannerTransitionEnd(): void {
    // If we landed on the clone (index = real length), silently jump to index 0
    if (this.currentSlide() >= this.bannerSlides.length) {
      this.bannerTransition.set(false);
      this.currentSlide.set(0);
      // Re-enable transition after a frame so the silent reset isn't animated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.bannerTransition.set(true));
      });
    }
  }

  private startBannerAutoSlide(): void {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    if (this.bannerSlides.length < 2) return;
    this.bannerInterval = setInterval(() => {
      // Go to next — allowed to reach bannerSlides.length (the clone)
      this.currentSlide.set(this.currentSlide() + 1);
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    this.topProductsObserver?.disconnect();
    this.dealsObserver?.disconnect();
    this.frequentlyBoughtObserver?.disconnect();
    this.footerObserver?.disconnect();
  }

  private setupTopProductsObserver(): void {
    const el = this.topProductsGrid?.nativeElement;
    if (!el || this.topProductsObserver) return;
    this.topProductsObserver = new IntersectionObserver(
      (entries) => { this.topProductsVisible.set(entries[0].isIntersecting); },
      { threshold: 0.1 }
    );
    this.topProductsObserver.observe(el);
  }

  private setupDealsObserver(): void {
    const el = this.dealsGrid?.nativeElement;
    if (!el || this.dealsObserver) return;
    this.dealsObserver = new IntersectionObserver(
      (entries) => { this.dealsVisible.set(entries[0].isIntersecting); },
      { threshold: 0.1 }
    );
    this.dealsObserver.observe(el);
  }

  private setupFrequentlyBoughtObserver(): void {
    const el = this.frequentlyBoughtGrid?.nativeElement;
    if (!el || this.frequentlyBoughtObserver) return;
    this.frequentlyBoughtObserver = new IntersectionObserver(
      (entries) => { this.frequentlyBoughtVisible.set(entries[0].isIntersecting); },
      { threshold: 0.1 }
    );
    this.frequentlyBoughtObserver.observe(el);
  }

  private setupFooterObserver(): void {
    const el = this.footerEl?.nativeElement;
    if (!el || this.footerObserver) return;
    this.footerObserver = new IntersectionObserver(
      (entries) => { this.footerVisible.set(entries[0].isIntersecting); },
      { threshold: 0.1 }
    );
    this.footerObserver.observe(el);
  }

  // Navigation methods
  navigateToCategory(categoryId: string): void {
    // Check if the category is grocery-related and navigate to B2B page
    const category = this.featuredCategories.find(cat => cat._id === categoryId);
    
    if (category && (
      category.name.toLowerCase().includes('grocery') || 
      category.name.toLowerCase().includes('staples')
    )) {
      this.router.navigateByUrl('/b2b');
    } else {
      this.router.navigate(['/shop/category', categoryId]);
    }
  }

  navigateToSubcategory(subcategoryId: string): void {
    this.router.navigate(['/shop/subcategory', subcategoryId]);
  }

  navigateToBrand(brandId: string): void {
    this.router.navigate(['/shop/brand', brandId]);
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/shop/product', productId]);
  }

  navigateToShop(): void {
    this.router.navigate(['/shop']);
  }

  navigateToDeals(): void {
    this.router.navigate(['/products']);
  }

  // Utility methods
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

  // Single default image used whenever a real image is missing
  readonly defaultImage = 'assets/images/product-placeholder.svg';

  // Pastel colors for brand avatars — one distinct shade per slot
  private readonly brandAvatarColors = [
    '#FFD6D6', '#D6ECFF', '#D6FFD6', '#FFE8D6',
    '#EDD6FF', '#FFFBD6', '#D6FFFF', '#FFD6F0',
  ];

  getCategoryImage(category: Category): string {
    return category.image || this.defaultImage;
  }

  getBrandLogo(brand: Brand): string {
    return brand.logo || this.defaultImage;
  }

  getProductImage(product: Product): string {
    return product.images && product.images.length > 0
      ? product.images[0]
      : this.defaultImage;
  }

  getBrandInitials(name: string): string {
    return name.trim().charAt(0).toUpperCase();
  }

  getBrandAvatarColor(index: number): string {
    return this.brandAvatarColors[index % this.brandAvatarColors.length];
  }

  onBrandImageError(_event: Event, index: number): void {
    this.brandLogoErrors.add(index);
    this.cdr.detectChanges();
  }

  get shouldScrollCategories(): boolean {
    return this.featuredCategories.length > 5;
  }

  // Fallback when an image URL is set but fails to load
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src.indexOf(this.defaultImage) === -1) {
      img.src = this.defaultImage;
    }
  }


  // Cart functionality
  get cartItemCount(): number {
    return this.cartService.itemCount();
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  addToCart(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!product._id) {
      this.toastService.error('Cannot add product to cart');
      return;
    }

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

  // Wishlist functionality
  loadWishlistStatus(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (items: any[]) => {
        this.wishlistProductIds = new Set(items.map((item: any) => item.productId));
        this.cdr.detectChanges();
      },
      error: (_err: any) => {
        // Silent error for wishlist status
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

    if (!product._id) {
      this.toastService.error('Cannot toggle wishlist');
      return;
    }

    if (this.isInWishlist(product._id)) {
      this.wishlistService.removeFromWishlist(product._id).subscribe({
        next: () => {
          this.wishlistProductIds.delete(product._id!);
          this.toastService.success('Removed from wishlist');
          this.cdr.detectChanges();
        },
        error: (_err: any) => {
          this.toastService.error('Failed to remove from wishlist');
        }
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
        error: (_err: any) => {
          this.toastService.error('Failed to add to wishlist');
        }
      });
    }
  }

  get wishlistCount(): number {
    return this.wishlistService.wishlistCount();
  }

  navigateToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  viewWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  viewAccount(): void {
    this.router.navigate(['/auth/sign-in']);
  }
}
