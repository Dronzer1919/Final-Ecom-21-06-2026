import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Supplier {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  supplierCode?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierResponse {
  success: boolean;
  message: string;
  data: {
    suppliers: Supplier[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private apiUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  createSupplier(data: Supplier): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllSuppliers(page = 1, limit = 10, search?: string, isActive?: boolean): Observable<SupplierResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<SupplierResponse>(this.apiUrl, { params });
  }

  getSupplierById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateSupplier(id: string, data: Partial<Supplier>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteSupplier(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
