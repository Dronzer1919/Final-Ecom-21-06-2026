import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StoreAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface Store {
  _id?: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: StoreAddress;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StoreResponse {
  success: boolean;
  message: string;
  data: {
    stores: Store[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private apiUrl = `${environment.apiUrl}/stores`;

  constructor(private http: HttpClient) {}

  createStore(data: Store): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  bulkCreateStores(data: Partial<Store>[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-create`, data);
  }

  getAllStores(page = 1, limit = 10, search?: string, isActive?: boolean): Observable<StoreResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<StoreResponse>(this.apiUrl, { params });
  }

  getStoreById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateStore(id: string, data: Partial<Store>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteStore(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
