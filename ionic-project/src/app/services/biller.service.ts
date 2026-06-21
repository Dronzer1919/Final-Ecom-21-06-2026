import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Biller {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  billerCode?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BillerResponse {
  success: boolean;
  message: string;
  data: {
    billers: Biller[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class BillerService {
  private apiUrl = `${environment.apiUrl}/billers`;

  constructor(private http: HttpClient) {}

  createBiller(data: Biller): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllBillers(page = 1, limit = 10, search?: string, isActive?: boolean): Observable<BillerResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<BillerResponse>(this.apiUrl, { params });
  }

  getBillerById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateBiller(id: string, data: Partial<Biller>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteBiller(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
