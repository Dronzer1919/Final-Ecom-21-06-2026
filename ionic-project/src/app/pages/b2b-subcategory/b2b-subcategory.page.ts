import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonContent } from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { B2BCatalogService, B2BSubcategory, B2BCategory } from '../../services/b2b-catalog.service';
import { CartService } from '../../services/cart';
import { environment } from '../../../environments/environment';
import { lastValueFrom } from 'rxjs';

interface ProductItem {
  productId: string;
  productName: string;
  category: string;
  image: string;
  vendorCount: number;
  priceRange: { min: number; max: number };
  unit: string;
  description: string;
}

@Component({
  selector: 'app-b2b-subcategory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, AppHeaderComponent],
  templateUrl: './b2b-subcategory.page.html',
  styleUrls: ['./b2b-subcategory.page.scss']
})
export class B2BSubcategoryPage implements OnInit {
  categoryId = '';
  subcategoryId = '';
  isLoading = true;
  errorMessage = '';
  viewMode: 'grid' | 'table' = 'grid';
  searchTerm = '';

  category: B2BCategory | undefined;
  subcategory: B2BSubcategory | undefined;
  products: ProductItem[] = [];
  filteredProducts: ProductItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private catalogService: B2BCatalogService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';
    this.subcategoryId = this.route.snapshot.paramMap.get('subcategoryId') || '';

    if (this.catalogService.loaded$.value) {
      this._loadMetadata();
    } else {
      const sub = this.catalogService.loaded$.subscribe((loaded) => {
        if (loaded) {
          this._loadMetadata();
          sub.unsubscribe();
        }
      });
    }

    this._fetchProducts();
  }

  private _loadMetadata(): void {
    this.category = this.catalogService.getCategoryById(this.categoryId);
    this.subcategory = this.catalogService.getSubcategoryById(this.categoryId, this.subcategoryId);
  }

  private async _fetchProducts(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const res = await lastValueFrom(
        this.http.get<any>(
          `${environment.apiUrl}/products?subCategory=${this.subcategoryId}&isB2B=true&limit=100`
        )
      );
      const raw: any[] = res?.data ?? res?.products ?? res?.data?.products ?? [];
      this.products = raw.map(p => ({
        productId:   p._id,
        productName: p.name ?? p.productName ?? '',
        category:    typeof p.category === 'object' ? (p.category?.name ?? '') : '',
        image:       p.images?.[0] ?? '',
        vendorCount: p.vendorCount ?? 1,
        priceRange:  { min: p.price ?? 0, max: p.price ?? 0 },
        unit:        typeof p.unit === 'object'
                       ? (p.unit?.shortName ?? p.unit?.name ?? 'Pcs')
                       : (p.unit ?? 'Pcs'),
        description: p.description ?? ''
      }));
      this.filteredProducts = [...this.products];
    } catch (err) {
      console.error('[B2BSubcategoryPage] Failed to fetch products:', err);
      this.errorMessage = 'Failed to load products. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = term
      ? this.products.filter(p => p.productName.toLowerCase().includes(term))
      : [...this.products];
  }

  refresh(): void {
    this.searchTerm = '';
    this._fetchProducts();
  }

  viewProductVendors(product: ProductItem): void {
    this.router.navigate(['/b2b-marketplace', product.productId]);
  }

  addToCart(product: ProductItem, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart({
      id: product.productId,
      name: product.productName,
      price: product.priceRange.min,
      image: product.image,
      category: product.category
    } as any, 1);
  }

  goBack(): void {
    this.router.navigate(['/b2b-categories']);
  }
}
