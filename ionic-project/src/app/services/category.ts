import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  code?: string;
  description?: string;
  image?: string;
  productCount?: number;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private categories = signal<Category[]>([]);

  constructor(private http: HttpClient) {}

  getAllCategories(
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
        if (response.success && response.data?.categories) {
          this.categories.set(response.data.categories);
        }
      })
    );
  }

  // Get category by ID
  getCategoryById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Get categories signal
  getCategoriesSignal() {
    return this.categories;
  }
}
