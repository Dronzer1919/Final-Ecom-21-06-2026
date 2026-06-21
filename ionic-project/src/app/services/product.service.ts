import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  _id?: string;
  name: string;
  store: string | { _id: string; name: string };
  warehouse: string | { _id: string; name: string };
  category: string | { _id: string; name: string };
  subCategory?: string | { _id: string; name: string };
  brand?: string | { _id: string; name: string };
  unit: string | { _id: string; name: string; shortName: string };
  itemCode: string;
  barcodeSymbology?: string;
  description?: string;
  quantity: number;
  price: number;
  taxType?: string;
  discountType?: string;
  discountValue?: number;
  quantityAlert?: number;
  warranty?: string;
  manufacturer?: string;
  expiryOn?: Date;
  images?: string[];
  status?: 'Active' | 'Inactive';
  productType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  createProduct(data: FormData | Product): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  bulkCreateProducts(products: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-create`, { products });
  }

  getAllProducts(page = 1, limit = 10, search?: string, isActive?: boolean, category?: string, brand?: string): Observable<ProductResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    if (category) params = params.set('category', category);
    if (brand) params = params.set('brand', brand);
    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: string, data: Partial<Product> | FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getExpiredProducts(page = 1, limit = 10): Observable<ProductResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit).set('expired', true);
    return this.http.get<ProductResponse>(`${this.apiUrl}/expired`, { params });
  }

  getLowStockProducts(page = 1, limit = 10): Observable<ProductResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ProductResponse>(`${this.apiUrl}/low-stock`, { params });
  }
}
