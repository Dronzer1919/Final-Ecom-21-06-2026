import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WarehouseAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface Warehouse {
  _id?: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: WarehouseAddress;
  capacity?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WarehouseResponse {
  success: boolean;
  message: string;
  data: {
    warehouses: Warehouse[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private apiUrl = `${environment.apiUrl}/warehouses`;

  constructor(private http: HttpClient) {}

  createWarehouse(data: Warehouse): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  bulkCreateWarehouses(data: Partial<Warehouse>[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-create`, data);
  }

  getAllWarehouses(page = 1, limit = 10, search?: string, isActive?: boolean): Observable<WarehouseResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<WarehouseResponse>(this.apiUrl, { params });
  }

  getWarehouseById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateWarehouse(id: string, data: Partial<Warehouse>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteWarehouse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
