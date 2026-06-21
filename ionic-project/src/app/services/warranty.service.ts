import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Warranty {
  _id?: string;
  name: string;
  duration?: number;
  durationUnit?: 'Days' | 'Months' | 'Years';
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WarrantyResponse {
  success: boolean;
  message: string;
  data: {
    warranties: Warranty[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class WarrantyService {
  private apiUrl = `${environment.apiUrl}/warranties`;

  constructor(private http: HttpClient) {}

  createWarranty(data: Warranty): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllWarranties(page = 1, limit = 10, search?: string, isActive?: boolean): Observable<WarrantyResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (isActive !== undefined) params = params.set('isActive', isActive);
    return this.http.get<WarrantyResponse>(this.apiUrl, { params });
  }

  getWarrantyById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateWarranty(id: string, data: Partial<Warranty>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteWarranty(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
