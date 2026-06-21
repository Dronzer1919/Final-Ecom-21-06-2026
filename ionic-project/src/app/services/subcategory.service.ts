import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Subcategory {
  _id?: string;
  name: string;
  code: string;
  category: string | { _id: string; name: string };
  parentSubcategory?: string | { _id: string; name: string };
  description?: string;
  icon?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubcategoryResponse {
  success: boolean;
  message: string;
  data: {
    subcategories: Subcategory[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class SubcategoryService {
  private apiUrl = `${environment.apiUrl}/subcategories`;
  private subSubApiUrl = `${environment.apiUrl}/sub-sub-categories`;

  constructor(private http: HttpClient) {}

  createSubcategory(data: Subcategory): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  bulkCreateSubcategories(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-create`, data);
  }

  getAllSubcategories(page = 1, limit = 10, search?: string, category?: string, isActive?: boolean, parentSubcategory?: string): Observable<SubcategoryResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    if (parentSubcategory) params = params.set('parentSubcategory', parentSubcategory);
    return this.http.get<SubcategoryResponse>(this.apiUrl, { params });
  }

  // ── Sub-Sub Category dedicated methods ────────────────────────────────────

  getAllSubSubCategories(page = 1, limit = 100, search?: string, parentSubcategory?: string): Observable<SubcategoryResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (parentSubcategory) params = params.set('parentSubcategory', parentSubcategory);
    return this.http.get<SubcategoryResponse>(this.subSubApiUrl, { params });
  }

  createSubSubCategory(data: any): Observable<any> {
    return this.http.post(`${this.subSubApiUrl}/create`, data);
  }

  bulkCreateSubSubCategories(data: any[]): Observable<any> {
    return this.http.post(`${this.subSubApiUrl}/bulk-create`, data);
  }

  // ─────────────────────────────────────────────────────────────────────────

  getSubcategoryById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateSubcategory(id: string, data: Partial<Subcategory>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteSubcategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
