import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { Product } from '../../services/product';
import { ShimmerComponent } from '../../components/shimmer';
import { environment } from '../../../environments/environment';

interface SupplierInfo {
  supplierId: string;
  supplierName: string;
  rating: number;
  reviewCount: number;
  price: number;
  unit: string;
  location: string;
  responseRate: number;
  hasGST: boolean;
  hasEmail: boolean;
  hasMobile: boolean;
  memberSince: string;
  bulkPricing?: BulkPrice[];
}

interface BulkPrice {
  quantity: number;
  unit: string;
  price: number;
  discount: number;
}

interface B2BProduct {
  productId: string;
  productName: string;
  category: string;
  variety: string;
  image: string;
  supplier: SupplierInfo;
}

@Component({
  selector: 'app-b2b-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, AppHeaderComponent, ShimmerComponent],
  templateUrl: './b2b-marketplace.page.html',
  styleUrls: ['./b2b-marketplace.page.scss']
})
export class B2BMarketplacePage implements OnInit {
  searchText = '';
  selectedCity = '';
  selectedPriceRange = '';
  selectedVariety = '';
  selectedLocality = '';
  selectedProductId = '';
  viewMode: 'grid' | 'list' = 'list';
  expandedRows = new Set<string>();
  isLoading = true;

  cities = ['Pune', 'Pimpri Chinchwad', 'Raigad', 'Baramati', 'Mumbai', 'Thane', 'Hyderabad', 'Bengaluru', 'Coimbatore', 'Chennai', 'Delhi', 'All India'];
  priceRanges = ['Below ₹70', '₹71 - ₹90', '₹91 - ₹100', 'Above ₹101'];
  varieties = ['1121', '1509', 'Pusa', 'Traditional', '1718', '1401'];
  localities = ['Gultekdi', 'Market Yard'];

  products: B2BProduct[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['productId'];
      if (productId) {
        this.selectedProductId = productId;
        this._loadMarketplaceListings(productId);
      } else {
        this.isLoading = false;
      }
    });
  }

  private _loadMarketplaceListings(productId: string): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/b2b/marketplace/${productId}`).subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        this.products = Array.isArray(data) ? data : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[B2BMarketplace] Failed to load listings:', err);
        this.products = [];
        this.isLoading = false;
      }
    });
  }
  get filteredProducts(): B2BProduct[] {
    return this.products.filter(product => {
      // Filter by product ID if coming from category page
      const matchesProductId = !this.selectedProductId || product.productId === this.selectedProductId;
      
      const matchesSearch = !this.searchText || 
        product.productName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        product.category.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesCity = !this.selectedCity || 
        product.supplier.location.toLowerCase().includes(this.selectedCity.toLowerCase());
      
      const matchesVariety = !this.selectedVariety || product.variety === this.selectedVariety;
      
      let matchesPrice = true;
      if (this.selectedPriceRange && product.supplier.price > 0) {
        const price = product.supplier.price;
        if (this.selectedPriceRange === 'Below ₹70') matchesPrice = price < 70;
        else if (this.selectedPriceRange === '₹71 - ₹90') matchesPrice = price >= 71 && price <= 90;
        else if (this.selectedPriceRange === '₹91 - ₹100') matchesPrice = price >= 91 && price <= 100;
        else if (this.selectedPriceRange === 'Above ₹101') matchesPrice = price > 101;
      }

      return matchesProductId && matchesSearch && matchesCity && matchesVariety && matchesPrice;
    });
  }

  selectCity(city: string) {
    this.selectedCity = this.selectedCity === city ? '' : city;
  }

  clearFilters() {
    this.selectedCity = '';
    this.selectedPriceRange = '';
    this.selectedVariety = '';
    this.selectedLocality = '';
    this.searchText = '';
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }

  contactSupplier(product: B2BProduct) {
    console.log('Contacting supplier:', product.supplier.supplierName);
    alert(`Contact Request Sent to ${product.supplier.supplierName} for ${product.productName}`);
  }

  requestQuote(product: B2BProduct) {
    console.log('Requesting quote for:', product.productName);
    alert(`Quote request sent for ${product.productName} from ${product.supplier.supplierName}`);
  }

  viewNumber(product: B2BProduct) {
    alert(`Contact Number: +91-XXXXXXXXXX\n${product.supplier.responseRate}% Response Rate`);
  }

  // Header navigation methods
  get cartItemCount(): number {
    return this.cartService.itemCount();
  }

  addToCart(product: B2BProduct, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const cartProduct: Product = {
      id: product.productId + '-' + product.supplier.supplierId,
      name: product.productName + ' - ' + product.supplier.supplierName,
      price: product.supplier.price,
      image: product.image,
      category: product.category
    };
    this.cartService.addToCart(cartProduct);
  }

  toggleView(mode: 'grid' | 'list'): void {
    if (this.viewMode !== mode) {
      this.isLoading = true;
      this.viewMode = mode;
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }
  }

  toggleRow(supplierId: string): void {
    console.log('Toggle row clicked for supplier:', supplierId);
    if (this.expandedRows.has(supplierId)) {
      this.expandedRows.delete(supplierId);
      console.log('Row collapsed');
    } else {
      this.expandedRows.add(supplierId);
      console.log('Row expanded');
    }
    console.log('Expanded rows:', Array.from(this.expandedRows));
  }

  isRowExpanded(supplierId: string): boolean {
    const isExpanded = this.expandedRows.has(supplierId);
    console.log('Check if row expanded - Supplier:', supplierId, 'Expanded:', isExpanded);
    return isExpanded;
  }

  get wishlistCount(): number {
    return this.wishlistService.wishlistCount();
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
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
