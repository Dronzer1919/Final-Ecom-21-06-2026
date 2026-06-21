import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Brand {
  _id?: string;
  name: string;
  code?: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrl = `${environment.apiUrl}/brands`;
  private brands = signal<Brand[]>([]);

  constructor(private http: HttpClient) {}

  getAllBrands(
    page: number = 1,
    limit: number = 100,
    search?: string,
    isActive?: boolean
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      tap(response => {
        if (response.success && response.data?.brands) {
          this.brands.set(response.data.brands);
        }
      })
    );
  }

  // Get brand by ID
  getBrandById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createBrand(data: Brand): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateBrand(id: string, data: Partial<Brand>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteBrand(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  bulkCreateBrands(data: Partial<Brand>[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bulk-create`, data);
  }

  // Get brands signal
  getBrandsSignal() {
    return this.brands;
  }
}
