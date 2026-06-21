import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  discountType?: string;
  discountValue?: number;
  image?: string;
  images?: string[];
  category: string | { _id: string; name: string; id?: string };
  brand?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  featured?: boolean;
  stock?: number;
  sku?: string;
  barcode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private products = signal<Product[]>([]);
  private featuredProducts = signal<Product[]>([]);

  constructor(private http: HttpClient) {}

  getAllProducts(
    page: number = 1,
    limit: number = 100,
    search?: string,
    isActive?: boolean,
    category?: string,
    brand?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }

    if (category && category !== 'Category') {
      params = params.set('category', category);
    }

    if (brand && brand !== 'Brand') {
      params = params.set('brand', brand);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.products.set(response.data);
        }
      })
    );
  }

  // Get product by ID
  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Get products by category
  getProductsByCategory(category: string, params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/category/${category}`, { params });
  }

  // Get low stock products
  getLowStockProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/low-stock/alert`);
  }

  getFeaturedProducts(limit: number = 10): Observable<any> {
    return this.getAllProducts(1, limit, undefined, true).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.featuredProducts.set(response.data);
        }
      })
    );
  }

  getDealsOfTheDay(limit: number = 10): Observable<any> {
    return this.getAllProducts(1, limit, undefined, true);
  }

  // Get products signal
  getProductsSignal() {
    return this.products;
  }

  // Get featured products signal  
  getFeaturedProductsSignal() {
    return this.featuredProducts;
  }
}
